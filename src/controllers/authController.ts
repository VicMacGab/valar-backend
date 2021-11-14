import express, { Request, Response, Router } from "express";
import { compare } from "bcrypt";

import securityService from "../services/securityService";
import logger from "../services/logger";
import userService from "../services/userService";

import { USER } from "../utils/constants/messages";
import { AUTH } from "../utils/constants/general";
import { UserDTO } from "../utils/dtos/user";
import { validBody } from "../utils/validation/body";

const authController: Router = express.Router();

// TODO: 2 factor (para confirmar mail en signup y loggear en signin) (nodemailer, setear una expiración al código)

// TODO: verified a false cuando haga logout (por el two-factor)

// TODO: JWT en HTTP-ONLY & Secure cookie para guardar el username antes de que llene authCode

authController.post("/auth/signup", async (req: Request, res: Response) => {
  if (!validBody(req.body, AUTH.SIGNUP_KEYS)) {
    return res.status(400).json({ msg: "IncorrectBody" });
  }

  try {
    const [found, username] = await userService.findByUsernameOrEmail(
      req.body.username,
      req.body.email
    );
    if (found) {
      if (username == req.body.username) {
        logger.error("username conflict", req.body);
        return res.status(409).json({ msg: USER.ERROR.USERNAME_CONFLICT });
      } else {
        logger.error("email conflict");
        return res.status(409).json({ msg: USER.ERROR.EMAIL_CONFLICT });
      }
    } else {
      try {
        const h = await securityService.hashPassword(req.body.password);
        let user: Partial<UserDTO> = {
          username: req.body.username,
          email: req.body.email,
          password: h,
        };
        await userService.create(user as UserDTO);
        delete user.password;
        return res.status(201).json({ msg: USER.SUCCESS.CREATION, user });
      } catch (err) {
        logger.error("user creation", err);
        return res.status(500).json({ msg: USER.ERROR.CREATION, err });
      }
    }
  } catch (err) {
    logger.error("user search", err);
    return res.status(500).json({ msg: USER.ERROR.GENERIC, err });
  }
});

authController.post("/auth/signin", async (req: Request, res: Response) => {
  if (!validBody(req.body, AUTH.SIGNIN_KEYS)) {
    return res.status(400).json({ msg: "Incorrect body." });
  }

  try {
    const [found, user] = await userService.findByUsername(req.body.username);
    if (found) {
      logger.info("user search", user);
      compare(req.body.password, user!.password!, (err, result) => {
        if (err) {
          return res.status(500).json({ msg: USER.ERROR.GENERIC, err });
        }
        if (result) {
          // randomInt(1000, 9999, (err, val) => {
          //   if (err) {
          //     return res.status(500).json({ msg: USER.ERROR.GENERIC });
          //   }
          //   codes[user.username] = val;
          //   transporter
          //     .sendMail({
          //       from: '"Valar" <reva.pacocha48@ethereal.email>', // sender address
          //       to: user.email, // list of receivers
          //       subject: "Two Factor Authentication", // Subject line
          //       text: `Your two factor authentication code is: ${val}`, // plain text body
          //       html: "<b>Hello world?</b>", // html body
          //     })
          //     .then(() => {
          //       logger.info(`Auth code ${val}`);
          //       setTimeout(() => {
          //         delete codes[user.username];
          //       }, 20 * 1000);
          //     })
          //     .catch((err) => {
          //       logger.error(err);
          //     });
          // });
          return res.status(202).json({ msg: USER.SUCCESS.SIGNIN });
        } else {
          return res.status(401).json({ msg: USER.ERROR.SIGNIN });
        }
      });
    } else {
      logger.error("user search");
      return res.status(404).json({ msg: `${USER.ERROR.SIGNIN}` });
    }
  } catch (err) {
    logger.error("user search", err);
    return res.status(500).json({ msg: USER.ERROR.GENERIC, err });
  }
});

authController.get("/user/log", (req: Request, res: Response) => {
  logger.info("req.body");
  logger.json(JSON.stringify(req.body, null, 2));
  return res.status(200).json({ msg: "a" });
});

export default authController;
