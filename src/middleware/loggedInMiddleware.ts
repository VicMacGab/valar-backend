import { Request, Response, NextFunction } from "express";
import { USER } from "../utils/constants/messages";
import logger from "../services/logger";

const loggedInMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.warn(
    `incoming signed cookies: ${JSON.stringify(req.signedCookies, null, 2)}`
  );
  logger.warn(
    `incoming normal cookies: ${JSON.stringify(req.cookies, null, 2)}`
  );

  const { valarSession } = req.signedCookies;

  if (valarSession === false) {
    // NOTE: el usuario cambió el valor del cookie
    return res.status(403).json({ msg: USER.ERROR.TAMPERED_COOKIE });
  } else if (valarSession === undefined) {
    // NOTE: el usuario no está loggeado
    return res.status(403).json({ msg: USER.ERROR.NOT_LOGGED_IN });
  }

  next();
};

export default loggedInMiddleware;
