import { CallbackError, Document } from "mongoose";
import Chat from "../models/Chat";
import { ChatDTO } from "../utils/dtos/chat";
import User from "../models/User";

import { UserDTO } from "../utils/dtos/user";
import { MessageDTO } from "../utils/dtos/message";
import logger from "./loggerService";
import Message from "../models/Message";

export type MongooseUserQueryResult =
  | (Document<any, any, UserDTO> & UserDTO & { _id: string })
  | null;

export type MongooseChatQueryResult =
  | (Document<any, any, ChatDTO> & ChatDTO & { _id: string })
  | null;

const chatService = {
  getChatsByUsername: async (
    username: string
  ): Promise<MongooseUserQueryResult | any> => {
    try {
      const chats = await User.findOne(
        { username: username },
        "chats.user chats.chat"
      ).populate("chats.user", "username");
      return chats;
    } catch (err) {
      return err;
    }
  },

  getMessagesForChat: async (
    chatId: string
  ): Promise<MongooseChatQueryResult | any> => {
    try {
      //TODO optimizar lo de los mensajes
      const chat = await Message.find(
        { chatId: chatId },
        "content usernameFrom edited deleted timestamp _id"
      );
      logger.info(`${JSON.stringify(chat, null, 2)}`);
      return chat;
    } catch (err) {
      return err;
    }
  },

  insertMessageToChat: async (
    message: MessageDTO
  ): Promise<MongooseChatQueryResult | any> => {
    try {
      logger.debug(`message: ${JSON.stringify(message, null, 2)}`);
      const res = await Message.create(message);
      logger.debug(`saved message res: ${JSON.stringify(res, null, 2)}`);
      return res;
    } catch (error) {
      return error;
    }
  },

  editMessageInChat: async (
    username: string,
    content: string,
    messageId: string
  ): Promise<Boolean | any> => {
    try {
      const msg = await Message.findById(messageId);
      //TODO arreglar para que sea con ids
      if (msg?.usernameFrom != username) return false;
      msg!.content = content;
      msg!.edited = true;
      await msg?.save();
      return true;
    } catch (err) {
      return err;
    }
  },

  removeMessageInChat: async (
    username: string,
    messageId: string
  ): Promise<Boolean | any> => {
    try {
      const msg = await Message.findById(messageId);
      if (msg?.usernameFrom != username) return false;
      msg!.content = "";
      msg!.deleted = true;
      await msg?.save();
      return false;
    } catch (err) {
      return err;
    }
  },

  removeChat: async (
    username: string,
    chatId: string
  ): Promise<Boolean | any> => {
    try {
      const p1 = Message.deleteMany({ chatId: chatId });
      const chat = await Chat.findById(chatId);
      if (chat?.user1 != username && chat?.user2 != username) return false;
      const p2 = User.findByIdAndUpdate(
        chat?.user1,
        { $pull: { chats: { chat: chatId } } },
        { projection: "" }
      );
      const p3 = User.findByIdAndUpdate(
        chat?.user2,
        { $pull: { chats: { chat: chatId } } },
        { projection: "" }
      );
      await Promise.all([p1, p2, p3]);
      return true;
    } catch (err) {
      return err;
    }
  },
};

export default chatService;
