import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import http from "http";
import https from "https";
import { Server } from "socket.io";
import { getServerFrom } from "./utils/server/general";

import helloController from "./controllers/helloController";
import authController from "./controllers/authController";
import userController from "./controllers/userController";
import cookieParser from "cookie-parser";
import logger from "./services/logger";

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

api.use(
  cors({
    origin:
      process.env.NODE_ENV == "production"
        ? "https://valar-frontend.vercel.app"
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
  return res.status(418).json("Soy un teapot.");
});

api.use("/api", helloController);
api.use("/api", authController);
api.use("/api", userController);

const server: http.Server | https.Server = getServerFrom(api);
const io = new Server(server);

// TODO: register web socket handlers

io.on("connection", (socket) => {
  logger.info("new ws connection");
  socket.on("message", (msg) => {
    logger.info(`message from client: ${JSON.stringify(msg, null, 2)}`);
  });
});

export default server;
