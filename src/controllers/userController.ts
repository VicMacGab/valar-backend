import express, { Request, Response, Router } from "express";
import ensureLoggedInMiddleware from "../middleware/ensureLoggedInMiddleware";

import logger from "../services/loggerService";
import userService from "../services/userService";

import { USER } from "../utils/constants/messages";

const userController: Router = express.Router();

userController.use("/user", ensureLoggedInMiddleware);

userController.get("/user/:username", async (req: Request, res: Response) => {
  const username = req.params.username;
  if (!username) {
    logger.error("user search");
    return res.status(400).json({ msg: USER.ERROR.BAD_REQUEST });
  }
  logger.info(`searching for username: ${username}`);
  try {
    const [found] = await userService.findByUsername(username, "_id");
    if (found) {
      logger.info("user search", username);
      return res.status(200).json({ msg: USER.SUCCESS.FOUND, username });
    } else {
      logger.error("user search");
      return res.status(404).json({ msg: USER.ERROR.NOT_FOUND });
    }
  } catch (err) {
    logger.error("user search", err);
    return res.status(500).json({ msg: USER.ERROR.GENERIC, err });
  }
});

export default userController;
