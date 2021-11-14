import express, { NextFunction, Request, Response } from "express";
import cors from "cors";

import helloController from "./controllers/helloController";
import authController from "./controllers/authController";
import userController from "./controllers/userController";
import logger from "./services/logger";
import helmet from "helmet";

const api: express.Express = express();

/*
Helmet is actually just a collection of smaller middleware functions that set security-related HTTP response headers:

  csp sets the Content-Security-Policy header to help prevent cross-site scripting attacks and other cross-site injections.
  hidePoweredBy removes the X-Powered-By header.
  hsts sets Strict-Transport-Security header that enforces secure (HTTP over SSL/TLS) connections to the server.
  ieNoOpen sets X-Download-Options for IE8+.
  noCache sets Cache-Control and Pragma headers to disable client-side caching.
  noSniff sets X-Content-Type-Options to prevent browsers from MIME-sniffing a response away from the declared content-type.
  frameguard sets the X-Frame-Options header to provide clickjacking protection.
  xssFilter sets X-XSS-Protection to disable the buggy Cross-site scripting (XSS) filter in web browsers.
*/
// api.use(helmet());

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
api.use("/api", authController);
api.use("/api", userController);

export default api;
