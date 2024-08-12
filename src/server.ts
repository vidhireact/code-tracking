import App from "./app";

import { connectDb } from "./dbConnection";

import dotenv from "dotenv";
dotenv.config();

process.env.TZ = "UTC";
const serverPort = parseInt(process.env.PORT) || 3000;

connectDb()
  .then(async () => {
    App.start(serverPort);
    App.instance.listen(serverPort, function () {
      console.info(
        `App listening on environment "${process.env.NODE_ENV}" ${serverPort}`
      );
    });
  })
  .catch((error) => {
    console.error("error while connect to database", error);
  });
