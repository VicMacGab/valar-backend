var fs = require("fs");
var https = require("https");
var privateKey = fs.readFileSync("sslcert/server.key", "utf8");
var certificate = fs.readFileSync("sslcert/server.crt", "utf8");

import api from "./app";
import mongoose from "mongoose";

var credentials = { key: privateKey, cert: certificate };

var httpsServer = https.createServer(credentials, api);

mongoose
  .connect(process.env.DB_URL!)
  .then(() => {
    console.log("sucessfully connected to mongo db 🤓");
    httpsServer.listen(process.env.PORT, () => {
      console.log("Server Ready ⚡");
      console.log(`Listening on: localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("cannot connect to mongo db: ", JSON.stringify(err, null, 2));
  });
