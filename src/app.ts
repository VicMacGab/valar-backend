import express, { Request, Response } from "express";
import cors from "cors";
import pinoHttp from "pino-http";

import helloController from "./controllers/helloController";
import userController from "./controllers/userController";

const api: express.Express = express();

// esto loggea cada incoming request y outgoing response
api.use(
  pinoHttp({
    transport: {
      target: "pino-pretty",
    },
  })
);

// for parsing application/json
api.use(
  express.json({
    limit: "50mb",
  })
);

// for parsing application/x-www-form-urlencoded
api.use(
  express.urlencoded({
    extended: true,
    limit: "50mb",
  })
);

api.use(cors());

api.get("/api", (req: Request, res: Response) => {
  return res.status(418).json("Soy un teapot.");
});

api.use("/api", helloController);
api.use("/api", userController);

export default api;
