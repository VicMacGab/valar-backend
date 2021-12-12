import { Request, Response, NextFunction } from "express";
import { USER } from "../utils/constants/messages";
import logger from "../services/loggerService";
import cookieParser from "cookie-parser";

const ensureLoggedInMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { valarSession } = req.signedCookies;
  const unsignedCookie = cookieParser.signedCookie(
    req.cookies.valarSession,
    process.env.COOKIES_SECRET!
  );

  if (valarSession === false) {
    // NOTE: el usuario cambió el valor del cookie
    logger.error(`tampered cookie from ip: ${req.ip}`);
    return res.status(403).json({ msg: USER.ERROR.TAMPERED_COOKIE });
  } else if (valarSession === undefined || valarSession === unsignedCookie) {
    // NOTE: el usuario no está loggeado
    logger.error(
      `tried to access protected ensureLoggedInMiddleware route from ip: ${req.ip}`
    );
    return res.status(403).json({ msg: USER.ERROR.NOT_LOGGED_IN });
  }

  req.signedCookies.valarSession = JSON.parse(valarSession);

  next();
};

export default ensureLoggedInMiddleware;
