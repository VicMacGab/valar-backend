import api from "./app";
import mongoose from "mongoose";

const port: number = 5000;

// TODO: .env

mongoose
  .connect(
    "mongodb+srv://gambo:YxFLW9H7LQC7EdIa@valar.edrdc.mongodb.net/valar?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("sucessfully connected to mongo db :)");
    api.listen(port, () => {
      console.log("Server Ready 😎");
      console.log(`Listening on: localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log("cannot connect to mongo db: ", err);
  });
