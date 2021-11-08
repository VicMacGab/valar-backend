import express, { Request, Response, Router } from "express";

import { USER } from "../utils/constants/messages";
import { UserDTO } from "../utils/dtos/user";

import User from "../models/User";

import logger from "../services/logger";
import userService from "../services/userService";

const userController: Router = express.Router();

// controller de login

// 2 factor, mandar mail
// hashear password

// hacer services

userController.post("/user/signup", async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({
      $or: [{ username: req.body.username }, { email: req.body.email }],
    }).exec();
    if (user) {
      if (user.username == req.body.username) {
        logger.error("username conflict");
        return res.status(409).json({ msg: USER.ERROR.USERNAME_CONFLICT });
      } else {
        logger.error("email conflict");
        return res.status(409).json({ msg: USER.ERROR.EMAIL_CONFLICT });
      }
    } else {
      userService
        .create(req.body)
        .then((newUser: UserDTO) => {
          logger.info("user creation", newUser);
          return res
            .status(201)
            .json({ msg: USER.SUCCESS.CREATION, newUser: newUser });
        })
        .catch((err) => {
          logger.error("user creation", err);
          return res.status(500).json({ msg: USER.ERROR.CREATION, err });
        });
    }
  } catch (err) {
    logger.error("user search", err);
    return res.status(500).json({ msg: USER.ERROR.GENERIC, err });
  }
});

//TODO: crear índice hash en username
userController.post("/user/signin", (req: Request, res: Response) => {
  if (!req.query.username) {
    logger.error("user search");
    return res.status(400).json({ msg: `${USER.ERROR.BAD_REQUEST}` });
  }
  User.findOne(
    { username: req.body.username },
    "username verified",
    (err, user: UserDTO) => {
      if (err) {
        logger.error("user search", err);
        return res.status(500).json({ msg: USER.ERROR.GENERIC, err });
      } else {
        if (!user) {
          logger.error("user search");
          return res.status(404).json({ msg: `${USER.ERROR.NOT_FOUND}` });
        }
        logger.info("user search", user);
        return res.status(200).json({ msg: USER.SUCCESS.FOUND, user });
      }
    }
  );
});

userController.get("/user/search/:username", (req: Request, res: Response) => {
  const username = req.params.username;
  if (!username) {
    logger.error("user search");
    return res.status(400).json({ msg: `${USER.ERROR.BAD_REQUEST}` });
  }
  User.findOne({ username: username }, "username", (err, user: UserDTO) => {
    if (err) {
      logger.error("user search", err);
      return res.status(500).json({ msg: USER.ERROR.GENERIC, err });
    } else {
      if (!user) {
        logger.error("user search");
        return res.status(404).json({ msg: `${USER.ERROR.NOT_FOUND}` });
      }
      logger.info("user search", user);
      return res.status(200).json({ msg: USER.SUCCESS.FOUND, user });
    }
  });
});

export default userController;
