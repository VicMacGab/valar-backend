import express, { NextFunction, Request, Response } from "express";
import cors from "cors";

import helloController from "./controllers/helloController";
import userController from "./controllers/userController";
import logger from "./services/logger";

const api: express.Express = express();

// si no hago esto, sabrán que estamos usando Express
// 'X-Powered-By' sería igual a 'Express'
api.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("x-powered-by", "Sapaso");
  next();
});

// esto loggea cada incoming request y outgoing response
// api.use((req, res, next) => {
//   logger.request(req);
//   logger.response(res);
//   next();
// });

// for parsing body con application/json
api.use(
  express.json({
    limit: "50mb",
  })
);

// for parsing body con application/x-www-form-urlencoded
api.use(
  express.urlencoded({
    extended: true,
    limit: "50mb",
  })
);

// por ahora permitir requests de cualquier origen
// TODO: ver como hacemos esto
api.use(
  cors({
    origin: "*",
  })
);

api.get("/api", (req: Request, res: Response) => {
  return res.status(418).json("Soy un teapot.");
});

api.use("/api", helloController);
api.use("/api", userController);

export default api;
