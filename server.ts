import app from "./app/app";
import connectDB from "./utils/db";

app.listen(process.env.PORT, () => {
  console.log(`Server is running port on ${process.env.PORT}`);
  connectDB();
});
