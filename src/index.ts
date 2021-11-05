import api from "./app";
import mongoose from "mongoose";

const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");

dotenvExpand(dotenv.config());

mongoose
  .connect(process.env.DB_URL!)
  .then(() => {
    console.log("sucessfully connected to mongo db :)");
    api.listen(process.env.PORT, () => {
      console.log("Server Ready 😎");
      console.log(`Listening on: localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("cannot connect to mongo db: ", err);
  });
