import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";

import helloController from "./controllers/helloController";
import authController from "./controllers/authController";
import userController from "./controllers/userController";
import cookieParser from "cookie-parser";

const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");

dotenvExpand(dotenv.config());

const api: express.Express = express();

// setear headers
api.use(helmet());

// TODO: asegurarnos que los logs no expongan información sensible
// TODO: convertir el transport del log a un archivo .log y reducirlo al logging que sea necesario
// TODO: comprimir (gzip) la ruta que devuelve los mensajes
// TODO: CSRF protection: https://owasp.org/www-community/attacks/csrf
// TODO: cuidado con el control de inferencias con los mensajes de error y status codes
// TODO: crear la cuenta luego del two factor (signup)

// por ahora permitir requests de cualquier origen
// TODO: si no manda el Origin header, no dejarlo pasar
api.use(
  cors({
    origin:
      process.env.NODE_ENV == "production"
        ? "https://valar-frontend.vercel.app"
        : "http://localhost:3000",
    credentials: true,
  })
);

// for parsing body con application/json
api.use(
  express.json({
    limit: "1mb",
  })
);

// for parsing body con application/x-www-form-urlencoded
api.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

// para usar cookies firmadas
api.use(cookieParser(process.env.COOKIES_SECRET));

api.get("/api", (req: Request, res: Response) => {
  return res.status(418).json("Soy un teapot.");
});

api.use("/api", helloController);
api.use("/api", authController);
api.use("/api", userController);

export default api;
