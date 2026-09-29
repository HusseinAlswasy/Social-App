import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { PORT } from "./config/config.service";
import type { NextFunction, Request, Response } from "express";
import AppError from "./common/middleware/globalErrorHandel.middleware";
import userRouter from "./modules/auth/auth.controller";
import connectionDB from "./DB/connectionDB";
const app = express();
const port = PORT;

export const bootstrap = async () => {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    handler: (req: Request, res: Response, next: NextFunction) => {
      res.status(429).json({ message: "many request" });
    },
  });

  app.use(express.json());
  app.use(cors(), helmet(), limiter);

  await connectionDB()

  app.get("/", (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ message: "Welcome On Social App.....🎈🫡" });
  });

  app.use("/users",userRouter)

  app.use("{/*demo}", (req: Request, res: Response, next: NextFunction) => {
    throw new AppError(
      `URL:${req.originalUrl} with Method:${req.method} Not Found`,
      404,
    );
  });

  app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message, stack: err.stack });
  });

  app.listen(port, () => {
    console.log(`Social App is Running on port ${port} 🥳`);
  });
};
