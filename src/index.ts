import bodyParser from "body-parser";
import chalk from "chalk";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import helmet from "helmet";
import { Types } from "mongoose";
import morgan from "morgan";

import connectUserDB from "@/connections/userDB";
import { authenticate } from "@/middlewares/authMiddleware";
import { errorHandler } from "@/middlewares/errorMiddleware";
import authRouter from "@/routes/authRouter";
import gameRouter from "@/routes/gameRouter";
import trophyRouter from "@/routes/trophyRouter";
import userRouter from "@/routes/userRouter";

import "express-async-errors";

dotenv.config();

interface AuthUSer {
  _id: Types.ObjectId | string;
  name: string;
  email: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUSer | null;
    }
  }
}

const port = process.env.PORT ?? 3000;

const app = express();
// Apply color to the status code
morgan.token("status", (req: Request, res: Response) => {
  const status = res.statusCode;
  const color =
    status >= 500
      ? "red"
      : status >= 400
      ? "yellow"
      : status >= 300
      ? "cyan"
      : status >= 200
      ? "green"
      : "white";
  return chalk[color](status);
});

// Apply color to the method
morgan.token("method", (req: Request) => {
  const method = req.method;
  const color =
    method === "GET"
      ? "green"
      : method === "POST"
      ? "yellow"
      : method === "PUT"
      ? "cyan"
      : method === "DELETE"
      ? "red"
      : "white";
  return chalk[color](method);
});

app.use(morgan(":method :url - :status"));

app.use(express.json());

app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:8001",
    credentials: true,
    exposedHeaders: ["ETag"],
    methods: ["GET", " POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  })
);

app.use(cookieParser());

app.use(bodyParser.json()); // To recognize the req obj as a json obj
app.use(bodyParser.urlencoded({ extended: true })); // To recognize the req obj as strings or arrays. extended true to handle nested objects also

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

//Default Route
// app.use((req: Request, res: Response, next: NextFunction) => {
//   res.send("Server is up!");
// });

//Server Running Status
app.get("/status", (req: Request, res: Response) => res.sendStatus(200));

//Auth Routes
app.use("/auth", authRouter);
// app.use("/psnAuth/", authRouter);

//User Routes
app.use("/user", authenticate, userRouter);

// Set the authenticate middleware when using the endpoins in production
if (process.env.NODE_ENV === "production") {
  //Games Routes
  app.use("/game", authenticate, gameRouter);

  //Trophies Routes
  app.use("/trophy", authenticate, trophyRouter);
} else {
  //Games Routes
  app.use("/game", gameRouter);

  //Trophies Routes
  app.use("/trophy", trophyRouter);
}

//Error Handler
app.use(errorHandler);

//MongoDb Connection
connectUserDB();
