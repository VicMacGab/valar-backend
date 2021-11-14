import express, { NextFunction, Request, Response } from "express";
import cors from "cors";

import helloController from "./controllers/helloController";
import authController from "./controllers/authController";
import userController from "./controllers/userController";

const api: express.Express = express();

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

// por ahora permitir requests de cualquier origen
// TODO: ver como hacemos esto (la whitelist)
api.use(
  cors({
    origin: "*",
  })
);

api.get("/api", (req: Request, res: Response) => {
  return res.status(418).json("Soy un teapot.");
});

api.use("/api", helloController);
api.use("/api", authController);
api.use("/api", userController);

export default api;
