import express, { Request, Response, Router } from "express";
import chatService from "../services/chatService";
import ensureLoggedInMiddleware from "../middleware/ensureLoggedInMiddleware";
import logger from "../services/loggerService";
import { CHAT, MESSAGE } from "../utils/constants/messages";

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
    const chat = await chatService.getChatById(chatId);
    logger.info(`chat: ${JSON.stringify(chat, null, 2)}`);
    return res.status(200).json({ chat, me: username });
  } catch (err) {
    return res.status(500).json({ msg: CHAT.ERROR.GENERIC, err });
  }
});

chatController.put("/chats", async (req: Request, res: Response) => {
  // TODO: validate body
  const { chatId, message } = req.body;
  logger.debug(`body: ${JSON.stringify(req.body, null, 2)}`);
  try {
    await chatService.insertMessageToChat(chatId, message);
    return res.status(201).end();
  } catch (error) {
    return res.status(500).json({ msg: MESSAGE.ERROR.CREATION });
  }
});

export default chatController;
