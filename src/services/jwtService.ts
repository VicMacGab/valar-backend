import jwt from "jsonwebtoken";
import { JWT } from "../utils/constants/messages";
import logger from "./loggerService";

const jwtService = {
  sign: (payload: any, expiresIn?: number): Promise<string | undefined> => {
    return new Promise((resolve, reject) => {
      jwt.sign(
        payload,
        process.env.JWT_SECRET!,
        { algorithm: "HS512", expiresIn: expiresIn },
        (err: Error | null, token: string | undefined) => {
          if (err) {
            logger.error(err);
            reject(err);
          }
          logger.info(`generated token: ${token}`);
          resolve(token);
        }
      );
    });
  },
  verify: (token: string): Promise<jwt.JwtPayload> => {
    return new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET!, (err, decodedJWT) => {
        if (err) {
          logger.error(`error verifying jwt: ${err.name}`);
          if (err.name == "TokenExpiredError") {
            reject(JWT.EXPIRED);
          } else if (err.name == "JsonWebTokenError") {
            reject(JWT.MALFORMED);
          } else if (err.name == "NotBeforeError") {
            reject(JWT.NOT_ACTIVE);
          }
        } else {
          resolve(decodedJWT!);
        }
      });
    });
  },
};

export default jwtService;
