import { CallbackError } from "mongoose";
import User from "../models/User";
import { UserDTO } from "../utils/dtos/user";

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
        "username verified"
      )
        .exec()
        .then((user) => {
          if (user) resolve([true, user.username]);
          else resolve([false]);
        })
        .catch((err) => reject(err));
    });
  },

  findByUsername: (username: string): Promise<[boolean, UserDTO?]> => {
    return new Promise<[boolean, UserDTO?]>((resolve, reject) => {
      User.findOne({ username: username }, "username verified password email")
        .exec()
        .then((user) => {
          if (user) resolve([true, user]);
          else resolve([false]);
        })
        .catch((err) => reject(err));
    });
  },
};

export default userService;
