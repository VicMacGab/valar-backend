import express, { Request, Response, Router } from "express";
import chatService from "../services/chatService";
import ensureLoggedInMiddleware from "../middleware/ensureLoggedInMiddleware";
import logger from "../services/loggerService";
import { CHAT, MESSAGE } from "../utils/constants/messages";
import { RequestOptions } from "https";

const chatController: Router = express.Router();

chatController.use("/chats", ensureLoggedInMiddleware);

chatController.get("/chats/all", async (req: Request, res: Response) => {
  const { valarSession } = req.signedCookies;
  const { username } = valarSession;
  try {
    const chats = await chatService.getChatsByUsername(username);
    // logger.info(`chats: ${JSON.stringify(chats, null, 2)}`);
    return res.status(200).json({ chats: chats.chats });
  } catch (err) {
    return res.status(500).json({ msg: CHAT.ERROR.GENERIC, err });
  }
});

chatController.post("/chats", async (req: Request, res: Response) => {
  // TODO: validate body has chatId
  const { valarSession } = req.signedCookies;
  const { username } = valarSession;
  const { chatId } = req.body;
  logger.debug(`chatId: ${chatId}`);
  try {
    // TODO ver si es que yo tengo un chat con ese id
    // asi veo que es mio y poder detectar sapos
    const messages = await chatService.getMessagesForChat(chatId);
    logger.info(`chat: ${JSON.stringify(messages, null, 2)}`);
    return res
      .status(200)
      .json({ chat: { messages, _id: chatId }, me: username });
  } catch (err) {
    return res.status(500).json({ msg: CHAT.ERROR.GENERIC, err });
  }
});

chatController.put("/chats", async (req: Request, res: Response) => {
  // TODO: validate body
  const { message } = req.body;
  logger.debug(`body: ${JSON.stringify(req.body, null, 2)}`);
  try {
    await chatService.insertMessageToChat(message);
    return res.status(201).json({ msg: MESSAGE.SUCCESS.SENT });
  } catch (error) {
    return res.status(500).json({ msg: MESSAGE.ERROR.GENERIC });
  }
});

chatController.put(
  "/chats/editMessage",
  async (req: Request, res: Response) => {
    const { valarSession } = req.signedCookies;
    const { username } = valarSession;
    const { content, messageId } = req.body;
    try {
      const possible = await chatService.editMessageInChat(
        username,
        content,
        messageId
      );
      if (!possible) return res.status(403).json({ msg: MESSAGE.ERROR.NOTME });
      return res.status(200).json({ msg: MESSAGE.SUCCESS.EDITED });
    } catch (err) {
      return res.status(500).json({ msg: MESSAGE.ERROR.GENERIC });
    }
  }
);

chatController.put(
  "/chats/deleteMessage",
  async (req: Request, res: Response) => {
    const { valarSession } = req.signedCookies;
    const { username } = valarSession;
    const { messageId } = req.body;
    try {
      const possible = await chatService.removeMessageInChat(
        username,
        messageId
      );
      if (!possible) return res.status(403).json({ msg: MESSAGE.ERROR.NOTME });
      return res.status(200).json({ msg: MESSAGE.SUCCESS.DELETED });
    } catch (err) {
      return res.status(500).json({ msg: MESSAGE.ERROR.GENERIC });
    }
  }
);

chatController.delete(
  "chats/deleteChat",
  async (req: Request, res: Response) => {
    const { valarSession } = req.signedCookies;
    const { username } = valarSession;
    const { chatId } = req.body;
    try {
      const possible = await chatService.removeChat(username, chatId);
      if (!possible) return res.status(403).json({ msg: CHAT.ERROR.NOTME });
      return res.status(200).json({ msg: CHAT.SUCCESS.DELETED });
    } catch (err) {
      return res.status(500).json({ msg: CHAT.ERROR.GENERIC });
    }
  }
);

export default chatController;
