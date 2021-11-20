import { Request, Response, NextFunction } from "express";
import { MIDDLEWARE } from "../utils/constants/messages";
import logger from "../services/logger";
import jwtService from "../services/jwtService";

const ensureUsernameCookieMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.warn(
    `incoming normal cookies: ${JSON.stringify(req.cookies, null, 2)}`
  );

  // hay rutas que se usan para verificar el two factor code
  // solo deben ser accesidas si el user mandó el username cookie
  // sino, le estamos haciendp perder tiempo al sevidor, así que
  // este middleware se encarga de eso

  const { username: usernameCookie } = req.cookies;

  if (!usernameCookie) {
    return res.status(403).json({ msg: MIDDLEWARE.NOT_ALLOWED });
  }
  next();
};

export default ensureUsernameCookieMiddleware;
