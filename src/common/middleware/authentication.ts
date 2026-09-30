import type { NextFunction, Request, Response } from "express";
import AppError from "./globalErrorHandel.middleware.js";
import tokenServices from "../token/token.services.js";
import { string } from "zod";
import { JWT_SECRET } from "../../config/config.service.js";
import { userRepository } from "../../DB/repositories/user.repository.js";
import { RedisService } from "../service/redis.service.js";
import { IRequest } from "../types/request.type.js";
const userRepo = new userRepository();
const redisService = new RedisService();


export const authentication = async (
  req: IRequest,
  res: Response,
  next: NextFunction,
) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    throw new AppError("Please provide a valid token", 400);
  }
  const token = authorization.split(" ")[1];
  
  if (!token) {
    throw new AppError("Please provide a valid token", 400);
  }

  const decode = tokenServices.VerifyToken({ token, secretKey: JWT_SECRET! });

  if (!decode || !decode.id) {
    throw new AppError("invalid payload token", 400);
  }

  const user = await userRepo.findOne({
    filter: {
      _id: decode.id,
      isConfirmed: { $exists: true },
    },
  });

  if (!user) {
    throw new AppError("User Not Exist Or Not Confirmed");
  }
  const revokedToken = await redisService.getValue(
    `revoke_token:${user._id}:${decode.jti}`,
  );

  if (revokedToken) {
    throw new AppError("you are logout please login again...", 401);
  }

  req.user = user;
  req.decode = decode;

  next();
};

// import userModel from '../../models/user.model.js';
// import { verifyToken } from '../utils/token/token.services.js';

// export const authentication = async (req, res, next) => {
//     const authorization = req.headers.authorization;

//     if (!authorization?.startsWith("Bearer ")) {
//         throw new AppError("Please provide a valid token", {
//             cause: 401
//         });
//     }
//     const token = authorization.split(" ")[1];

//     const decode = verifyToken({ token: authorization, secretKey: process.env.JWT_SECRET });

//     if (!decode || !decode.id) {
//         throw new AppError("invalid payload token", { cause: 400 });
//     }

//     const user = await userModel.findOne({_id:decode.id})
//     if (!user) {
//         throw new AppError("User Not Exist");
//     }

//     req.user = user

//     next()
// }
