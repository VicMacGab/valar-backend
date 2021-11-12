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
};

export default userService;