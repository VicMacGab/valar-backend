import express, { Request, Response, Router } from "express";

import { USER } from "../utils/constants/messages";
import { UserDTO } from "../utils/dtos/user";

import logger from "../services/logger";
import userService from "../services/userService";

const userController: Router = express.Router();

userController.post("/user", (req: Request, res: Response) => {
  // TODO: validación de `req.body`
  userService
    .create(req.body)
    .then((newUser: UserDTO) => {
      logger.info("user creation", newUser);
      return res
        .status(201)
        .json({ msg: USER.SUCESS.CREATION, newUser: newUser });
    })
    .catch((err) => {
      logger.error("user creation", err);
      return res.status(500).json({ msg: `${USER.ERROR.CREATION}.\n${err}` });
    });
});

export default userController;
