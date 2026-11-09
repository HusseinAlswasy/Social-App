import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { PORT } from "./config/config.service";
import type { NextFunction, Request, Response } from "express";
import AppError, {
  GlobalErrorHandling,
} from "./common/middleware/globalErrorHandel.middleware";
import userRouter from "./modules/auth/auth.controller";
import notificationRouter from "./modules/notification/notification.controller";
import connectionDB from "./DB/connectionDB";
import RedisService from "./service/redis.service";
import postRouter from "./modules/post/post.controller";
import commentRouter from "./modules/comment/comment.controller";
import { schema_gql } from "./graphql/graphql.fileds";
import { createHandler } from "graphql-http/lib/use/express";
import {
  authentication,
  decode_and_fetchUser,
} from "./common/middleware/authentication";
import { Server, Socket } from "socket.io";
import redisService from "./service/redis.service";
import socketGateway from "./modules/gateway/socket.gateway.js";
import chatRouter from "./modules/chat/caht.controller.js";

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
  await RedisService;
  await connectionDB();

  app.get("/", (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ message: "Welcome On Social App.....🎈🫡" });
  });

  app.use(
    "/graphql",
    authentication,
    createHandler({ schema: schema_gql, context: (req) => ({ req }) }),
  );

  app.use("/users", userRouter);
  app.use("/posts", postRouter);
  app.use("/comment", commentRouter);

  app.use("/users/notifications", notificationRouter);

  app.use("/chat", chatRouter);

  app.use("{/*demo}", (req: Request, res: Response, next: NextFunction) => {
    throw new AppError(
      `URL:${req.originalUrl} with Method:${req.method} Not Found`,
      404,
    );
  });

  app.use(GlobalErrorHandling);

  const httpServer = app.listen(port, () => {
    console.log(`Social App is Running on port ${port} 🥳`);
  });

  await socketGateway.initIo(httpServer);
};
