import express, { Request, Response, Router } from "express";
import { compare } from "bcrypt";

import securityService from "../services/securityService";
import logger from "../services/logger";
import userService from "../services/userService";
import jwtService from "../services/jwtService";

import { AUTHCODE, JWT, USER } from "../utils/constants/messages";
import {
  AUTH,
  COOKIE_OPTIONS_2FACTOR,
  COOKIE_OPTIONS_SESSION,
  INVALID_BODY,
  MAX_AUTHCODE_NUM,
  MIN_AUTHCODE_NUM,
} from "../utils/constants/general";
import { UserDTO } from "../utils/dtos/user";
import { validBody } from "../utils/validation/body";
import twoFactorService from "../services/twoFactorService";
import { randomInt } from "crypto";
import ensureUsernameCookieMiddleware from "../middleware/ensureUsernameCookieMiddleware";
import ensureLoggedInMiddleware from "../middleware/ensureLoggedInMiddleware";

const authController: Router = express.Router();

// TODO: verified a false cuando haga logout (por el two-factor)

authController.post("/auth/signup", async (req: Request, res: Response) => {
  if (!validBody(req.body, AUTH.SIGNUP_KEYS)) {
    return res.status(400).json({ msg: INVALID_BODY });
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

        const usernameJWT = await jwtService.sign(
          { username: req.body.username },
          120
        );
        randomInt(1000, 9999, async (err, num) => {
          if (err) {
            return res.status(500).json({ msg: USER.ERROR.GENERIC });
          }

          try {
            await twoFactorService.createCode(
              req.body.username,
              req.body.email,
              num
            );
            return res
              .status(201)
              .cookie("username", usernameJWT, COOKIE_OPTIONS_2FACTOR)
              .json({ msg: AUTHCODE.SENT });
          } catch (error) {
            return res.status(500).json({ msg: USER.ERROR.GENERIC });
          }
        });
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
    return res.status(400).json({ msg: INVALID_BODY });
  }

  try {
    const [found, user] = await userService.findByUsername(req.body.username);
    if (found) {
      logger.info("user search", user);
      compare(
        req.body.password,
        user!.password!,
        async (err, passwordsMatch) => {
          if (err) {
            return res.status(500).json({ msg: USER.ERROR.GENERIC, err });
          }
          if (passwordsMatch) {
            try {
              const token = await jwtService.sign(
                { username: req.body.username },
                120
              );
              randomInt(
                MIN_AUTHCODE_NUM,
                MAX_AUTHCODE_NUM,
                async (err, num) => {
                  if (err) {
                    return res.status(500).json({ msg: USER.ERROR.GENERIC });
                  }

                  try {
                    await twoFactorService.createCode(
                      req.body.username,
                      user!.email,
                      num
                    );
                    return res
                      .status(201)
                      .cookie("username", token, COOKIE_OPTIONS_2FACTOR)
                      .json({ msg: AUTHCODE.SENT });
                  } catch (error) {
                    return res.status(500).json({ msg: USER.ERROR.GENERIC });
                  }
                }
              );
            } catch (jwtError) {
              return res.status(500).json({ msg: JWT.SIGN, jwtError });
            }
          } else {
            return res.status(401).json({ msg: USER.ERROR.SIGNIN });
          }
        }
      );
    } else {
      logger.error("user search");
      return res.status(404).json({ msg: `${USER.ERROR.SIGNIN}` });
    }
  } catch (err) {
    logger.error("user search", err);
    return res.status(500).json({ msg: USER.ERROR.GENERIC, err });
  }
});

// TODO: ponerle guard de brute force al signin y sign up

// TODO: hacer algo así
// const decodeJWTFromCookie = async (cookie: string) => {
//   try {
//     const decodedJWT = await jwtService.verify(cookie);
//     return [decodedJWT, null];
//   } catch (error) {
//     return [null, error];
//   }
// };

authController.get(
  "/auth/code/:authCode",
  ensureUsernameCookieMiddleware,
  async (req: Request, res: Response) => {
    const { authCode } = req.params;
    if (!authCode) {
      return res.status(400).json({ msg: USER.ERROR.AUTH_CODE });
    }

    logger.info(`checking validity of auth code: ${authCode}`);

    const { username: usernameCookie } = req.cookies;

    // lo de abajo ya no es necesario x el middleware
    // if (!usernameCookie) {
    //   logger.error("auth code expired");
    //   return res
    //     .status(403)
    //     .json({ msg: USER.ERROR.AUTH_CODE_EXPIRED })
    //     .clearCookie("username");
    // }

    try {
      const decodedJWT = await jwtService.verify(usernameCookie);
      logger.info(`decoded JWT: ${JSON.stringify(decodedJWT, null, 2)}`);

      const [codesMatched, codeExpired] = twoFactorService.verifyAuthCode(
        decodedJWT.username,
        +authCode
      );

      if (codesMatched) {
        return res
          .status(202)
          .clearCookie("username")
          .cookie(
            "valarSession",
            JSON.stringify({ username: decodedJWT.username }),
            COOKIE_OPTIONS_SESSION
          )
          .json({ msg: USER.SUCCESS.AUTH });
      } else if (!codesMatched && !codeExpired) {
        return res.status(404).json({ msg: "incorrect code" });
      } else {
        return res.status(403).json({ msg: "code expired" });
      }
    } catch (err) {
      logger.error(
        `error verifying username JWT: ${JSON.stringify(err, null, 2)}`
      );
      return res.status(403).json({ msg: err });
    }
  }
);

authController.post(
  "/auth/logout",
  ensureLoggedInMiddleware,
  (req: Request, res: Response) => {
    logger.info(
      `user logging out, his signed cookies: ${JSON.stringify(
        req.signedCookies,
        null,
        2
      )}`
    );
    return res
      .status(202)
      .clearCookie("valarSession")
      .json({ msg: USER.SUCCESS.LOGOUT });
  }
);

// NOTE: los de abajo solo son por debugging purposes

authController.post(
  "/auth/createAuthCode",
  async (req: Request, res: Response) => {
    randomInt(MIN_AUTHCODE_NUM, MAX_AUTHCODE_NUM, async (err, num) => {
      if (err) {
        return res.status(500).json({ msg: USER.ERROR.GENERIC });
      }

      try {
        await twoFactorService.createCode(
          req.body.username,
          req.body.email,
          num
        );
      } catch (error) {
        return res.status(500).json({ msg: USER.ERROR.GENERIC });
      }

      return res.status(201).json({ msg: AUTHCODE.SENT });
    });
  }
);

authController.post("/auth/verifyAuthCode", (req: Request, res: Response) => {
  const [codesMatched, codeExpired] = twoFactorService.verifyAuthCode(
    req.body.username,
    req.body.code
  );

  if (codesMatched) {
    return res.status(202).json({ msg: AUTHCODE.MATCHED });
  } else if (!codesMatched && !codeExpired) {
    return res.status(404).json({ msg: AUTHCODE.INCORRECT });
  } else {
    return res.status(403).json({ msg: AUTHCODE.EXPIRED });
  }
});

export default authController;
