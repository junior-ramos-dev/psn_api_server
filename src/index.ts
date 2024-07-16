import express, { Request, Response, NextFunction } from "express";
import connectUserDB from "./connections/userDB";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { authenticate } from "./middlewares/authMiddleware";
import { errorHandler } from "./middlewares/errorMiddleware";
import authRouter from "./routes/authRouter";
import userRouter from "./routes/userRouter";
import gameRouter from "./routes/gameRouter";
import trophyRouter from "./routes/trophyRouter";

import "express-async-errors";

dotenv.config();

interface UserBasicInfo {
  _id: string;
  name: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserBasicInfo | null;
    }
  }
}

const port = process.env.PORT ?? 3000;

const app = express();
app.use(morgan("tiny"));
app.use(express.json());

app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:8001",
    credentials: true,
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

//Auth Routes
app.use(authRouter);
app.use("/psnAuth/", authRouter);

//User Routes
app.use("/users", authenticate, userRouter);

//Games Routes
app.use("/games", gameRouter);

//Trophies Routes
app.use("/trophy", trophyRouter);

//Error Handler
app.use(errorHandler);

//MongoDb Connection
connectUserDB();
