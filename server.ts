import { configDotenv } from "dotenv";
import app from "./app/app";
import connectDB from "./utils/db";
configDotenv();

app.listen(process.env.PORT, () => {
  console.log(`Server is running port on ${process.env.PORT}`);
  connectDB();
});
