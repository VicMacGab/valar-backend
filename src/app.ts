import express, { Request, Response } from "express";
import helloController from "./controllers/helloController";
const cors = require("cors");

const api: express.Express = express();

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

export default api;
