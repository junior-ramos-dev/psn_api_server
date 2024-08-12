import mongoose from "mongoose";
import chalk from "chalk";

const chalkError = chalk.red;
const chalkInfo = chalk.green;
// const chalkWarning = chalk.yellow;

const connectUserDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || "");
    console.log(chalkInfo(`MongoDB Connected: ${conn.connection.host}`));
  } catch (error: any) {
    console.log(chalkError(`Error: ${error.message}`));
    process.exit(1);
  }
};

export default connectUserDB;
