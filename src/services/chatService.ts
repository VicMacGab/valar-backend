import { CallbackError, Document } from "mongoose";
import Chat from "../models/Chat";
import { ChatDTO } from "../utils/dtos/chat";
import User from "../models/User";

import { UserDTO } from "../utils/dtos/user";
import { MessageDTO } from "../utils/dtos/message";
import logger from "./loggerService";

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
      // .populate({
      //   path: "chats.chat",
      //   select: "user1 user2",
      //   populate: {
      //     path: "user1 user2",
      //     select: "username",
      //     match: { username: { $ne: username } },
      //     model: "User",
      //   },
      // })
      // .select("chat");
      return chats;
    } catch (err) {
      return err;
    }
  },

  getChatById: async (
    chatId: string
  ): Promise<MongooseChatQueryResult | any> => {
    try {
      const chat = await Chat.findById(chatId, "messages").exec();
      return chat;
    } catch (err) {
      return err;
    }
  },

  insertMessageToChat: async (
    chatId: string,
    message: MessageDTO
  ): Promise<MongooseChatQueryResult | any> => {
    try {
      logger.debug(`message: ${JSON.stringify(message, null, 2)}`);
      const res = await Chat.findByIdAndUpdate(
        chatId,
        {
          $push: { messages: message },
        },
        {
          new: true,
          projection: "messages._id",
        }
      ).exec();
      logger.debug(`saved message res: ${JSON.stringify(res, null, 2)}`);
      return res;
    } catch (error) {
      return error;
    }
  },
};

export default chatService;
