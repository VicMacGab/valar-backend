import http, { createServer } from "http";
import https from "https";
import fs from "fs";
import path from "path";
import express from "express";
import logger from "../../services/loggerService";

export const getServerFrom = (
  api: express.Express
): http.Server | https.Server => {
  if (process.env.NODE_ENV == "production") {
    const certAndKeyPath = path.join(__dirname, "../../../tls");
    const privateKey = fs.readFileSync(`${certAndKeyPath}/server.key`, "utf8");
    const certificate = fs.readFileSync(`${certAndKeyPath}/server.crt`, "utf8");
    const credentials = { key: privateKey, cert: certificate };
    const httpsServer = https.createServer(credentials, api);
    logger.info("sucessfully created https server");
    return httpsServer;
  } else {
    const httpServer: http.Server = createServer(api);
    logger.info("sucessfully created http server");
    return httpServer;
  }
};
