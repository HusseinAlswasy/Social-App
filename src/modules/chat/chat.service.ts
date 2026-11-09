import type { NextFunction, Request, Response } from "express";
import { userRepository } from "../../models/repositories/user.repository.js";
import AppError from "../../common/middleware/globalErrorHandel.middleware.js";
import { successResponse } from "../../common/utils/successResponse.js";
import { IRequest } from "../../common/types/request.type";
import { ChatRepository } from "../../models/repositories/chat.repository.js";
import type { Server, Socket } from "socket.io";
import { Types, isValidObjectId } from "mongoose";
import redisService from "../../service/redis.service.js";

type SendMessagePayload = {
  recipientId: string;
  content: string;
};

class chatService {
  constructor() {}
  private readonly _userModel = new userRepository();
  private readonly _chatModel = new ChatRepository();

  //========================Rest Api========================

  getChat = async (req: IRequest, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const chat = await this._chatModel.findOne({
      filter: {
        participants: { $all: [userId, req.user?._id] },
        group: { $exists: false },
      },
      options: {
        populate: { path: "participants", select: "fName lName email" },
      },
    });
    if (!chat) {
      throw new AppError("Chat Not Found", 404);
    }

    successResponse({
      res,
      status: 200,
      message: "Get Chat Successfully",
      data: { chat },
    });
  };

  //=======================socket============================
  hi = (data: any) => {
    console.log(data);
  };

  sendMessage = async (data: SendMessagePayload, socket: Socket,io:Server) => {
    const { recipientId, content: rawContent } = data;
    const content = rawContent?.trim();
    if (!recipientId || !content) {
      throw new AppError("Recipient and message content are required", 400);
    }
    if (!isValidObjectId(recipientId)) {
      throw new AppError("Invalid recipient ID", 400);
    }

    const createdBy = socket.data.user._id;
    const user = await this._userModel.findById(new Types.ObjectId(recipientId));
    if (!user) {
      throw new AppError("User Not Found", 404);
    }

    if (String(user._id) === String(createdBy)) {
      throw new AppError("You cannot send a message to yourself", 400);
    }

    let chat = await this._chatModel.findOneAndUpdate({
      filter: {
        participants: { $all: [user._id, createdBy] },
        group: { $exists: false },
      },
      update: {
        $push: { messages: { content, createdBy } },
      },
      options: {
        new: true,
        populate: { path: "participants", select: "fName lName email" },
      },
    });
    if (!chat) {
      chat = await this._chatModel.create({
        participants: [user._id, createdBy],
        messages: [{ content, createdBy }],
        createdBy,
      });
    }

    io.to(await redisService.getSockets(createdBy)).emit("successMessage",{content})
    io.to(await redisService.getSockets(sendTo)).emit("newMessage",{content,from:socket.data.user._id})

    return {
      recipientId: String(user._id),
      message: chat.messages.at(-1),
    };
  };

  getUsers = async (req: IRequest, res: Response) => {
  if (!req.user) {
    throw new AppError("User not found", 401);
  }

  const users = await this._userModel.find({
    filter: { _id: { $ne: req.user._id } },
    options: { select: "fName lName email" },
  });

  successResponse({
    res,
    status: 200,
    message: "Users fetched successfully",
    data: { users },
  });
};
}

export default new chatService();
