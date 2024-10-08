import chalk from "chalk";
import mongoose, { MongooseError } from "mongoose";

const chalkError = chalk.red;
const chalkInfo = chalk.green;
// const chalkWarning = chalk.yellow;

const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || "");
    console.log(chalkInfo(`MongoDB Connected: ${conn.connection.host}`));
  } catch (error: unknown) {
    if (error instanceof MongooseError) {
      console.log(chalkError(`Error: ${error.message}`));
      process.exit(1);
    }
  }
};

export default connectMongoDB;
