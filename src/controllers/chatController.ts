import express, { Request, Response, Router } from "express";
import chatService from "../services/chatService";
import ensureLoggedInMiddleware from "../middleware/ensureLoggedInMiddleware";
import logger from "../services/loggerService";
import { CHAT } from "../utils/constants/messages";

const chatController: Router = express.Router();

chatController.use("/chats", ensureLoggedInMiddleware);

chatController.get("/chats/all", async (req: Request, res: Response) => {
  const { valarSession } = req.signedCookies;
  const { username } = valarSession;
  try {
    const chats = await chatService.getChatsByUsername(username);
    logger.info(`chats: ${JSON.stringify(chats, null, 2)}`);
    return res.status(200).json({ chats });
  } catch (err) {
    return res.status(500).json({ msg: CHAT.ERROR.GENERIC, err });
  }
});

chatController.post("/chats", async (req: Request, res: Response) => {
  // TODO: validate body has chatId
  const { valarSession } = req.signedCookies;
  const { username } = valarSession;
  const { chatId } = req.body.chatId;
  try {
    // TODO ver si es que yo tengo un chat con ese id
    // asi veo que es mio y poder detectar sapos
    const chat = await chatService.getChatById(chatId);
    logger.info(`chat: ${JSON.stringify(chat, null, 2)}`);
    return res.status(200).json({ chat });
  } catch (err) {
    return res.status(500).json({ msg: CHAT.ERROR.GENERIC, err });
  }
});

export default chatController;
