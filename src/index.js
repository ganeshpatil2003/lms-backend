import { dataBaseConnection } from "./db/index.js";
import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});

dataBaseConnection()
  .then(
    app.listen(process.env.PORT || 8070, () => {
      console.log(`app listening on port : ${process.env.PORT || 8070}`);
    })
  )
  .catch((error) => {
    console.log("Database connection error.");
  });
