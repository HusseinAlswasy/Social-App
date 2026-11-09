import mongoose, { Types } from "mongoose";
import { OnModelEnum } from "../common/enums/post_enum.js";
import { required } from "zod/mini";

export interface IMessage {
  createdBy: Types.ObjectId;
  content: string;
}
export interface IChat {
  //ovo
  participants: Types.ObjectId[];
  createdBy: Types.ObjectId;
  messages: IMessage[];
  //ovm
  group?: string;
  groupImage?: string;
  roomId: string;
}

const MessagesSchema = new mongoose.Schema<IMessage>(
  {
    content: {type: String, required: true},
    
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    strictQuery: true,
  },
);

const ChatSchema = new mongoose.Schema<IChat>(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messages:[MessagesSchema],
    group:{
      type: String,
    },
    groupImage:{
      type: String,
    },
    roomId: {
      type: String,
    },
  },
  {
    timestamps: true,
    strictQuery: true,
  },
);

const ChatModel =
  mongoose.models.Chat || mongoose.model<IChat>("Chat", ChatSchema);

export default ChatModel;
