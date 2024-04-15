import mongoose from "mongoose";
mongoose.set("strictQuery", true);
mongoose.set("strictPopulate", false);
export const connectDb = () => {
  return mongoose.connect(process.env.DB_URL, {
    dbName: process.env.DB_NAME,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
  });
};
