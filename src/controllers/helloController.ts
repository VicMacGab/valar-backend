import express, { Request, Response, Router } from "express";
import helloService from "../services/helloService";

const helloController: Router = express.Router();

helloController.get("/hello", (req: Request, res: Response) => {
  return res.status(200).json(helloService.getMessage());
});

export default helloController;
