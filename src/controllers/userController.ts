import express, { Request, Response, Router } from "express";

import { hash, compare } from "bcrypt";

import { USER } from "../utils/constants/messages";
import { UserDTO } from "../utils/dtos/user";

import User from "../models/User";

import logger from "../services/logger";
import userService from "../services/userService";
import { CallbackError } from "mongoose";
import { SALT_ROUNDS } from "../utils/constants/general";

import transporter from "../services/mailService";
import codes from "../services/twoFactorService";
import { randomInt } from "crypto";

const userController: Router = express.Router();

// TODO: debería ser /auth/signin y /auth/signup

// TODO: 2 factor (para confirmar mail en signup y loggear en signin) (nodemailer, setear una expiración al código)

// TODO: hacer services (para que los controllers sean más legibles)

// TODO: hacer un servicio que valide el shape de los req.body (le pasamos un objeto
// TODO: que describe el shape (interfaz) que el req.body debería tener y si hay un mismatch
// TODO: le deolvemos 400 (Bad request, body does not have correct shape o algún mensaje así)

// TODO: no devolver el password

// TODO: verified a false cuando haga logout (por el two-factor)

// TODO: JWT en HTTP-ONLY & Secure cookie para guardar el username antes de que llene authCode

userController.post("/user/signup", async (req: Request, res: Response) => {
  try {
    const user = await User.findOne(
      {
        $or: [{ username: req.body.username }, { email: req.body.email }],
      },
      "username verified"
    ).exec();
    if (user) {
      if (user.username == req.body.username) {
        logger.error("username conflict", req.body);
        return res.status(409).json({ msg: USER.ERROR.USERNAME_CONFLICT });
      } else {
        logger.error("email conflict");
        return res.status(409).json({ msg: USER.ERROR.EMAIL_CONFLICT });
      }
    } else {
      let nUser: Partial<UserDTO> = {
        username: req.body.username,
        email: req.body.email,
      };

      hash(req.body.password, SALT_ROUNDS, (err, h) => {
        if (err) {
          return res.status(500).json({ msg: USER.ERROR.PASSWORD, err });
        }
        nUser.password = h;

        userService
          .create(nUser as UserDTO)

          .then((newUser: UserDTO) => {
            logger.info("user creation", newUser);
            //TODO: No retornar password
            return res
              .status(201)
              .json({ msg: USER.SUCCESS.CREATION, newUser });
          })
          .catch((err: CallbackError) => {
            logger.error("user creation", err);
            return res.status(500).json({ msg: USER.ERROR.CREATION, err });
          });
      });
    }
  } catch (err) {
    logger.error("user search", err);
    return res.status(500).json({ msg: USER.ERROR.GENERIC, err });
  }
});

userController.post("/user/signin", (req: Request, res: Response) => {
  if (!req.body.username) {
    logger.error("user search");
    return res.status(400).json({ msg: `${USER.ERROR.BAD_REQUEST}` });
  }

  User.findOne(
    { username: req.body.username },
    "username verified password email", // FIXME: outgoind requests, etc
    (err: CallbackError, user: UserDTO) => {
      if (err) {
        logger.error("user search", err);
        return res.status(500).json({ msg: USER.ERROR.GENERIC, err });
      } else {
        if (!user) {
          logger.error("user search");
          return res.status(404).json({ msg: `${USER.ERROR.SIGNIN}` });
        }
        logger.info("user search", user);

        compare(req.body.password, user.password!, (err, result) => {
          if (err) {
            return res.status(500).json({ msg: USER.ERROR.GENERIC, err });
          }
          if (result) {
            randomInt(1000, 9999, (err, val) => {
              if (err) {
                return res.status(500).json({ msg: USER.ERROR.GENERIC });
              }
              codes[user.username] = val;

              transporter
                .sendMail({
                  from: '"Valar" <reva.pacocha48@ethereal.email>', // sender address
                  to: user.email, // list of receivers
                  subject: "Two Factor Authentication", // Subject line
                  text: `Your two factor authentication code is: ${val}`, // plain text body
                  html: "<b>Hello world?</b>", // html body
                })
                .then(() => {
                  logger.info(`Auth code ${val}`);
                  setTimeout(() => {
                    delete codes[user.username];
                  }, 20 * 1000);
                })
                .catch((err) => {
                  logger.error(err);
                });
            });

            return res.status(202).json({ msg: USER.SUCCESS.SIGNIN });
          } else {
            return res.status(401).json({ msg: USER.ERROR.SIGNIN });
          }
        });
      }
    }
  );
});

// para mandar solicitud
userController.get("/user/search/:username", (req: Request, res: Response) => {
  const username = req.params.username;
  if (!username) {
    logger.error("user search");
    return res.status(400).json({ msg: `${USER.ERROR.BAD_REQUEST}` });
  }
  User.findOne(
    { username: username },
    "username",
    (err: CallbackError, user: UserDTO) => {
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

userController.get("/user/log", (req: Request, res: Response) => {
  logger.info("req.body");
  logger.json(JSON.stringify(req.body, null, 2));
  return res.status(200).json({ msg: "a" });
});

export default userController;
