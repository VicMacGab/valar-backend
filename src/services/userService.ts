import { CallbackError, Document } from "mongoose";
import User from "../models/User";
import { UserDTO } from "../utils/dtos/user";

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

  //TODO hacer proyeccion con un parametro
  findByUsername: (
    username: string
  ): Promise<[boolean, MongooseUserQueryResult?]> => {
    return new Promise<[boolean, MongooseUserQueryResult?]>(
      (resolve, reject) => {
        User.findOne(
          { username: username },
          "_id username verified password email outgoingRequests incomingRequests"
        )
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
        User.findOne({ username: username }, "outgoingRequests _id chats")
          .populate("outgoingRequests.user", "username")
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
    // TODO: hacer que chats solo devuelva quiénes son los miembros por default, sino la cagada: nos devolverá todos los mensajes siempre
    return new Promise<[boolean, MongooseUserQueryResult?]>(
      (resolve, reject) => {
        User.findOne({ username: username }, "incomingRequests _id chats")
          .populate("incomingRequests.user", "username")
          .exec()
          .then((user: MongooseUserQueryResult) => {
            if (user) resolve([true, user]);
            else resolve([false]);
          })
          .catch((err) => reject(err));
      }
    );
  },
};

export default userService;
