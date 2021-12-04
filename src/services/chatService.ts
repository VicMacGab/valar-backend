import { CallbackError, Document } from "mongoose";
import Chat from "../models/Chat";
import { ChatDTO } from "../utils/dtos/chat";
import User from "../models/User";

import { UserDTO } from "../utils/dtos/user";

type MongooseUserQueryResult =
  | (Document<any, any, UserDTO> & UserDTO & { _id: string })
  | null;

type MongooseChatQueryResult =
  | (Document<any, any, ChatDTO> & ChatDTO & { _id: string })
  | null;

const chatService = {
  getChatsByUsername: async (
    username: string
  ): Promise<MongooseUserQueryResult | unknown> => {
    try {
      const chats = await User.findOne({ username: username }, "chats.chatId")
        .populate({
          path: "chats.chatId",
          select: "user1 user2",
          populate: {
            path: "user1 user2",
            select: "username",
            match: { username: { $ne: username } },
            model: "User",
          },
        })
        .select("chatId");
      return chats;
    } catch (err) {
      return err;
    }
  },

  getChatById: async (
    chatId: string
  ): Promise<MongooseChatQueryResult | unknown> => {
    try {
      const chat = await Chat.findById(chatId, "messages").exec();
      return chat;
    } catch (err) {
      return err;
    }
  },
};

export default chatService;
