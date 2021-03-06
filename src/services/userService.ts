import { CallbackError, Document } from "mongoose";
import User from "../models/User";
import { UserDTO } from "../utils/dtos/user";
import logger from "./loggerService";

type MongooseUserQueryResult =
  | (Document<any, any, UserDTO> & UserDTO & { _id: string })
  | null;

const userService = {
  create: async (user: UserDTO): Promise<UserDTO> => {
    return new Promise<UserDTO>((resolve, reject) => {
      User.create(user, (err: CallbackError, newUser: UserDTO) => {
        if (err) {
          reject(err);
        }
        resolve(newUser);
      });
    });
  },

  findByUsernameOrEmail: (
    username: string,
    email: string
  ): Promise<[boolean, string?]> => {
    return new Promise<[boolean, string?]>((resolve, reject) => {
      User.findOne(
        {
          $or: [{ username: username }, { email: email }],
        },
        "username"
      )
        .exec()
        .then((user) => {
          if (user) resolve([true, user.username]);
          else resolve([false]);
        })
        .catch((err) => reject(err));
    });
  },

  findByUsername: (
    username: string,
    projection: string
  ): Promise<[boolean, MongooseUserQueryResult?]> => {
    return new Promise<[boolean, MongooseUserQueryResult?]>(
      (resolve, reject) => {
        User.findOne({ username: username }, projection)
          .exec()
          .then((user: MongooseUserQueryResult) => {
            if (user) resolve([true, user]);
            else resolve([false]);
          })
          .catch((err) => reject(err));
      }
    );
  },

  findByUsernameOutgoing: (
    username: string
  ): Promise<[boolean, MongooseUserQueryResult?]> => {
    return new Promise<[boolean, MongooseUserQueryResult?]>(
      (resolve, reject) => {
        User.findOne({ username: username }, "outgoingRequests _id")
          .populate("outgoingRequests.user", "_id username")
          .exec()
          .then((user: MongooseUserQueryResult) => {
            if (user) resolve([true, user]);
            else resolve([false]);
          })
          .catch((err) => reject(err));
      }
    );
  },

  findByUsernameIncoming: (
    username: string
  ): Promise<[boolean, MongooseUserQueryResult?]> => {
    return new Promise<[boolean, MongooseUserQueryResult?]>(
      (resolve, reject) => {
        User.findOne({ username: username }, "incomingRequests _id")
          .populate("incomingRequests.user", "_id username")
          .exec()
          .then((user: MongooseUserQueryResult) => {
            if (user) resolve([true, user]);
            else resolve([false]);
          })
          .catch((err) => reject(err));
      }
    );
  },

  findChatWithFriend: async (username: string, friendsId: string) => {
    try {
      const friends = await User.findOne(
        { username: username, "chats.user": { $eq: friendsId } },
        "chats.chat"
      ).exec();
      return friends;
    } catch (error) {
      throw error;
    }
  },

  findRequestConflict: async (
    myUsername: string,
    friendsUsername: string,
    friendsId: string
  ): Promise<boolean | unknown> => {
    if (friendsUsername == myUsername) return true;
    try {
      const user = await User.findOne(
        {
          username: myUsername,
          $or: [
            { "incomingRequests.user": { $eq: friendsId } },
            { "outgoingRequests.user": { $eq: friendsId } },
            { "chats.user": { $eq: friendsId } },
          ],
        },
        "_id"
      ).exec();
      logger.debug(`[findRequestConflict]: ${JSON.stringify(user, null, 2)}`);
      return user !== null;
    } catch (error) {
      throw error;
    }
  },
};

export default userService;
