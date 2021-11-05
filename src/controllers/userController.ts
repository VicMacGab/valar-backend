import express, { Request, Response, Router } from "express";
import logger from "../services/logger";

import User from "../models/User";
import { USER } from "../utils/constants/messages";

const userController: Router = express.Router();

userController.post("/user", (req: Request, res: Response) => {
  logger.info("user creation body", req.body);

  // TODO: mover esta lógica al service
  const newUser = User.create(req.body, (err: any, result: any) => {
    if (err) {
      logger.error("user creation", err);
      return res.status(500).json({ msg: `${USER.ERROR.CREATION}.\n${err}` });
    }
    logger.info("user creation body", newUser);
    return res.status(201).json({ msg: USER.SUCESS.CREATION, newUser: result });
  });
});

export default userController;
