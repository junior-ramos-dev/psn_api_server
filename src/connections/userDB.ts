import mongoose from "mongoose";
import chalk from "chalk";

const error = chalk.red;
const warning = chalk.yellow;
const info = chalk.green;

const connectUserDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || "");
    console.log(info(`MongoDB Connected: ${conn.connection.host}`));
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectUserDB;
