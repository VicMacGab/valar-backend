import server from "./app";
import mongoose from "mongoose";
import logger from "./services/logger";

mongoose
  .connect(process.env.DB_URL!)
  .then(() => {
    logger.info("sucessfully connected to mongo db 🤓");

    if (process.env.NODE_ENV == "production") {
      server.listen(443, () => {
        logger.info("Valar Backend Initiatied.");
      });
    } else {
      server.listen(process.env.PORT, () => {
        logger.info("Server Ready ⚡");
        logger.info(`Listening on http://localhost:${process.env.PORT}`);
      });
    }
  })
  .catch((err) => {
    logger.error("cannot connect to mongo db: ", JSON.stringify(err, null, 2));
  });
