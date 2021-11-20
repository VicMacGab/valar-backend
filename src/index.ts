// import fs from "fs";
// import https from "https";

import api from "./app";
import mongoose from "mongoose";

// const privateKey = fs.readFileSync("sslcert/server.key", "utf8");
// const certificate = fs.readFileSync("sslcert/server.crt", "utf8");
// const credentials = { key: privateKey, cert: certificate };

// const httpsServer = https.createServer(credentials, api);

mongoose
  .connect(process.env.DB_URL!)
  .then(() => {
    console.log("sucessfully connected to mongo db 🤓");

    if (process.env.NODE_ENV == "production") {
      // httpsServer.listen(() => {
      //   console.log("Valar Backend Initiatied.");
      // });
    } else {
      api.listen(process.env.PORT, () => {
        console.log("Server Ready ⚡");
        console.log(`Listening on http://localhost:${process.env.PORT}`);
      });
    }
  })
  .catch((err) => {
    console.log("cannot connect to mongo db: ", JSON.stringify(err, null, 2));
  });
