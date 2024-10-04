import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import session from "express-session";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import connectMongoDB from "@/connections/mongoDB";
import { errorHandler } from "@/middlewares/errorMiddleware";
import authRouter from "@/routes/authRouter";
import gameIconRouter from "@/routes/gameIconRouter";
import gameRouter from "@/routes/gameRouter";
import trophyRouter from "@/routes/trophyRouter";
import userRouter from "@/routes/userRouter";

import { IAuthUser } from "./models/interfaces/user";
import { IS_NODE_ENV_PRODUCTION } from "./utils/env";
import {
  applyColorToHttpMethod,
  applyColorToHttpStatusCode,
} from "./utils/http";
import swaggerOutput from "./swagger_output.json";

import "express-async-errors";

dotenv.config();

declare module "express-session" {
  export interface SessionData {
    user: IAuthUser;
    npsso: string;
  }
}

const port = process.env.PORT ?? 3000;

const app = express();
// Apply color to the status code
morgan.token("status", (req: Request, res: Response) => {
  const status = res.statusCode;
  return applyColorToHttpStatusCode(status);
});

// Apply color to the method
morgan.token("method", (req: Request) => {
  const method = req.method;
  return applyColorToHttpMethod(method);
});

app.use(morgan(":method :url - :status"));

app.use(express.json());

app.use(helmet());

const corsDefaultConfig = {
  origin: "http://localhost:8001",
  credentials: true,
  exposedHeaders: ["ETag"],
  methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH", "OPTIONS"],
};

app.use(cors(corsDefaultConfig));

app.use(cookieParser());

app.use(
  session({
    secret: process.env.JWT_SECRET!,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: IS_NODE_ENV_PRODUCTION,
      sameSite: "strict",
      maxAge: 60 * 60 * 1000,
    },
  })
);

app.use(bodyParser.json()); // To recognize the req obj as a json obj
app.use(bodyParser.urlencoded({ extended: true })); // To recognize the req obj as strings or arrays. extended true to handle nested objects also

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerOutput));

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

//Server Running Status
app.use("/status", (req: Request, res: Response) => res.sendStatus(200));

//Auth Routes
app.use("/auth", authRouter);

//User Routes
app.use("/user", userRouter);

//Games Routes
app.use("/game", gameRouter);

//Games Icon Routes (use the same base path as game)
// The routes were moved to a separate file better reading
app.use("/game", gameIconRouter);

//Trophies Routes
app.use("/trophy", trophyRouter);

//Error Handler
app.use(errorHandler);

//MongoDb Connection
connectMongoDB();

// Run some code to clean things up before server exits or restarts
const stop = () => {
  server.on("close", function () {
    console.log("⬇ Shutting down server");
    process.exit();
  });
  server.close();
};

process.on("SIGINT", stop);
process.on("SIGTERM", stop);
process.on("SIGQUIT", stop);

process.once("SIGUSR2", function () {
  // Run some code to do a different kind of cleanup on nodemon restart:
  process.kill(process.pid, "SIGUSR2");
});
