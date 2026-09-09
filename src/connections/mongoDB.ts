import chalk from "chalk";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose, { MongooseError } from "mongoose";

const chalkError = chalk.red;
const chalkInfo = chalk.green;
const chalkWarning = chalk.yellow;

let memoryServer: MongoMemoryServer | null = null;

const startMemoryMongo = async () => {
  console.log(chalkWarning("Starting an in-memory MongoDB for local development."));
  memoryServer = await MongoMemoryServer.create();
  const conn = await mongoose.connect(memoryServer.getUri("psn_profile_manager"));
  console.log(chalkInfo(`MongoDB Memory Server Connected: ${conn.connection.host}`));
};

const connectMongoDB = async () => {
  const uri = process.env.MONGODB_URI || "";
  const useMemoryMongo =
    process.env.USE_IN_MEMORY_MONGODB === "true" ||
    process.env.USE_IN_MEMORY_MONGODB === "1";

  try {
    if (useMemoryMongo) {
      await startMemoryMongo();
      return;
    }

    const conn = await mongoose.connect(uri);
    console.log(chalkInfo(`MongoDB Connected: ${conn.connection.host}`));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    if (process.env.NODE_ENV !== "production") {
      console.log(chalkWarning(`Error connecting to MongoDB: ${message}`));
      try {
        await startMemoryMongo();
        return;
      } catch (memoryError: unknown) {
        const memoryMessage =
          memoryError instanceof Error ? memoryError.message : String(memoryError);
        console.log(chalkError(`Error starting in-memory MongoDB: ${memoryMessage}`));
        process.exit(1);
      }
    }

    if (error instanceof MongooseError) {
      console.log(chalkError(`Error: ${error.message}`));
    } else {
      console.log(chalkError(`Error: ${message}`));
    }
    process.exit(1);
  }
};

export default connectMongoDB;
