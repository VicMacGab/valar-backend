import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import http from "http";
import https from "https";
import { Server, Socket } from "socket.io";
import { getServerFrom } from "./utils/server/general";

import helloController from "./controllers/helloController";
import authController from "./controllers/authController";
import userController from "./controllers/userController";
import cookieParser from "cookie-parser";
import logger from "./services/loggerService";
import requestController from "./controllers/requestController";
import chatController from "./controllers/chatController";

import child_process from "child_process";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import ensureLoggedInMiddleware from "./middleware/ensureLoggedInMiddleware";
import chatService from "./services/chatService";

import { MessageDTO } from "./utils/dtos/message";
import { MessageAck } from "./utils/dtos/messageAck";
import { EditedMessageDto } from "./utils/dtos/editedMessage";
import { DeletedMessage } from "./utils/dtos/deletedMessage";
import { EditedMessageAck } from "./utils/dtos/editedMessageAck";
import { DeletedMessageAck } from "./utils/dtos/deletedMessageAck";

//TODO meter id en la galleta

const dotenv = require("dotenv");
dotenv.config();

const api: express.Express = express();

api.use(helmet());

// TODO: asegurarnos que los logs no expongan información sensible
// TODO: convertir el transport del log a un archivo .log y reducirlo al logging que sea necesario
// TODO: comprimir (gzip) la ruta que devuelve los mensajes
// TODO: CSRF protection: https://owasp.org/www-community/attacks/csrf
// TODO: cuidado con el control de inferencias con los mensajes de error y status codes
// TODO: crear la cuenta luego del two factor (signup)
// TODO: si no manda el Origin header, no dejarlo pasar
// TODO: crear la cuenta en la bd solo cuando hayamos verificado su correo

// FIXME: no esta funcionando
api.use(
  cors({
    origin:
      process.env.NODE_ENV == "production"
        ? "https://cliffdev.com"
        : "http://localhost:3000",
    credentials: true,
  })
);

api.use(
  express.json({
    limit: "1mb",
  })
);

api.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

api.use(cookieParser(process.env.COOKIES_SECRET));

api.get("/api", (req: Request, res: Response) => {
  return res.status(418).json("Soy un teapot v2.");
});

api.use("/api", helloController);
api.use("/api", authController);
api.use("/api", userController);
api.use("/api", requestController);
api.use("/api", chatController);

const server: http.Server | https.Server = getServerFrom(api);
const io = new Server(server);

// TODO: register web socket handlers

const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);

io.use(wrap(cookieParser(process.env.COOKIES_SECRET)));

io.use((socket, next) => {
  // @ts-ignore
  const { valarSession } = socket.request.signedCookies;
  const unsignedCookie = cookieParser.signedCookie(
    // @ts-ignore
    socket.request.cookies.valarSession,
    process.env.COOKIES_SECRET!
  );
  if (
    valarSession === false ||
    valarSession === undefined ||
    valarSession === unsignedCookie
  ) {
    logger.warn(
      `attempted unauthorized access from ip: ${socket.request.headers.origin}`
    );
    // TODO: desloguearlo
    const err = new Error("Unauthorized");
    next(err);
  } else {
    // @ts-ignore
    socket.request.signedCookies.valarSession = JSON.parse(valarSession);
    next();
  }
});

// namespace = una conexión TCP
io.on("connection", async (socket) => {
  logger.info(
    // @ts-ignore
    `user username: ${socket.request.signedCookies.valarSession.username} connection`
  );
  const chats = await chatService.getChatsByUsername(
    // @ts-ignore
    socket.request.signedCookies.valarSession.username
  );

  chats.chats.forEach((chat) => {
    logger.debug(
      // @ts-ignore
      `${socket.request.signedCookies.valarSession.username} joining ${chat.chat} chat...`
    );
    socket.join(chat.chat.toString());
  });

  socket.on(
    "messageEdit",
    async (
      editedMessage: EditedMessageDto,
      callback: (ack: EditedMessageAck) => void
    ) => {
      logger.info(`emitting 'messageEdit' event...`);
      try {
        // logger.debug(`edited msg: ${JSON.stringify(editedMessage, null, 2)}`);
        // @ts-ignore
        const username = socket.request.signedCookies.valarSession.username;
        await chatService.editMessageInChat(
          username,
          editedMessage.newContent,
          editedMessage.msgId,
          editedMessage.newNonce
        );
        socket.to(editedMessage.chatId).emit("peerMessageEdit", {
          msgId: editedMessage.msgId,
          newContent: editedMessage.newContent,
          newNonce: editedMessage.newNonce,
          msgIdx: editedMessage.msgIdx,
        });
        callback({
          ok: true,
        });
      } catch (error) {
        callback({
          ok: false,
          reason: error,
        });
      }
    }
  );
  socket.on(
    "messageDelete",
    async (
      deletedMessage: DeletedMessage,
      callback: (ack: DeletedMessageAck) => void
    ) => {
      logger.info(`emitting 'messageDelete' event...`);
      try {
        // @ts-ignore
        const username = socket.request.signedCookies.valarSession.username;
        await chatService.removeMessageInChat(username, deletedMessage.msgId);
        socket.to(deletedMessage.chatId).emit("peerMessageDelete", {
          msgId: deletedMessage.msgId,
          msgIdx: deletedMessage.msgIdx,
        });
        callback({
          ok: true,
        });
      } catch (error) {
        callback({
          ok: false,
          reason: error,
        });
      }
    }
  );

  socket.on(
    "message",
    async (msg: MessageDTO, callback: (ack: MessageAck) => void) => {
      logger.info(`emitting 'message' event...`);
      // logger.debug(
      //   `msg from ${
      //     // @ts-ignore
      //     socket.request.signedCookies.valarSession.username
      //   }: ${JSON.stringify(msg, null, 2)}`
      // );
      // logger.debug(`sending msg ${msg.content} to room ${msg.chatId}`);

      try {
        // TODO: mejorar
        const newMsg = await chatService.insertMessageToChat(msg);
        // logger.debug(`new Msg: ${JSON.stringify(newMsg, null, 2)}`);
        // logger.debug(`newMsg._id: ${newMsg._id}`);
        socket.to(msg.chatId).emit("message", {
          _id: newMsg._id.toString(),
          timestamp: newMsg.timestamp,
          ...msg,
        });
        callback({
          ok: true,
          _id: newMsg._id,
          timestamp: newMsg.timestamp,
        });
      } catch (error) {
        callback({
          ok: false,
          error: error,
        });
      }
    }
  );
  socket.on("disconnect", (reason) => {
    logger.error(
      `client disconnected because: ${JSON.stringify(reason, null, 2)}`
    );
  });
  socket.emit("ready");
});

export default server;
