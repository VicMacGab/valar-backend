import express, { Request, Response, Router } from "express";

import { USER } from "../utils/constants/messages";
import { UserDTO } from "../utils/dtos/user";

import User from "../models/User";

import securityService from "../services/securityService";

import logger from "../services/logger";
import userService from "../services/userService";
import { CallbackError } from "mongoose";

import transporter from "../services/mailService";
import codes from "../services/twoFactorService";
import { randomInt } from "crypto";
import { compare } from "bcrypt";

const authController: Router = express.Router();

// TODO: 2 factor (para confirmar mail en signup y loggear en signin) (nodemailer, setear una expiración al código)

// TODO: hacer un servicio que valide el shape de los req.body (le pasamos un objeto
// TODO: que describe el shape (interfaz) que el req.body debería tener y si hay un mismatch
// TODO: le deolvemos 400 (Bad request, body does not have correct shape o algún mensaje así)

// TODO: verified a false cuando haga logout (por el two-factor)

// TODO: JWT en HTTP-ONLY & Secure cookie para guardar el username antes de que llene authCode

authController.post("/auth/signup", async (req: Request, res: Response) => {
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
  if (!req.body.username) {
    logger.error("user search");
    return res.status(400).json({ msg: `${USER.ERROR.BAD_REQUEST}` });
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
