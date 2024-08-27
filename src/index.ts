import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import session from "express-session";
import helmet from "helmet";
import morgan from "morgan";

import connectMongoDB from "@/connections/mongoDB";
import { authenticate } from "@/middlewares/authMiddleware";
import { errorHandler } from "@/middlewares/errorMiddleware";
import authRouter from "@/routes/authRouter";
import gameRouter from "@/routes/gameRouter";
import trophyRouter from "@/routes/trophyRouter";
import userRouter from "@/routes/userRouter";

import { IAuthUser } from "./models/interfaces/user";
import { IS_NODE_ENV_PRODUCTION } from "./utils/env";
import {
  applyColorToHttpMethod,
  applyColorToHttpStatusCode,
} from "./utils/http";

import "express-async-errors";

dotenv.config();

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: IAuthUser | null;
    }
  }
}

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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

//Server Running Status
app.use("/status", (req: Request, res: Response) => res.sendStatus(200));

//Auth Routes
app.use("/auth", authRouter);

//User Routes
app.use("/user", authenticate, userRouter);

//Games Routes
app.use("/game", authenticate, gameRouter);

//Trophies Routes
app.use("/trophy", authenticate, trophyRouter);

//Error Handler
app.use(errorHandler);

//MongoDb Connection
connectMongoDB();
