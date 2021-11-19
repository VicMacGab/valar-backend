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

// por ahora permitir requests de cualquier origen
api.use(
  cors({
    origin: "https://valar-frontend.vercel.app/",
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
