import mongoose, { Types } from "mongoose";
import { hash } from "../common/security/hash";
import { PostAvailabilityEnum } from "../common/enums/post_enum";

export interface IPost {
  content: string;
  attachments?: string[];
  folderId?: string;
  createdBy: Types.ObjectId;
  tags?: Types.ObjectId[];
  likes?: Types.ObjectId[];
  allowComment?: boolean;
  availability?: PostAvailabilityEnum;
}

const postSchema = new mongoose.Schema<IPost>(
  {
    content: {
      type: String,
      required: function () {
        return !this?.attachments?.length;
      },
      trim: true,
    },
    attachments: {
      type: [String],
    },
    folderId: {
      type: String,
    },
    createdBy: {
      type: Types.ObjectId,
      required: true,
      ref: "User",
    },
    tags: {
      type: [mongoose.Types.ObjectId],
      ref: "User",
    },
    likes: {
      type: [mongoose.Types.ObjectId],
      ref: "User",
    },
    allowComment: {
      type: Boolean,
      default: true,
    },
    availability: {
      type: String,
      enum: PostAvailabilityEnum,
      default: "public",
    },
  },
  {
    timestamps: true,
    strictQuery: true,
  },
);

const postModel =
  mongoose.models.Post || mongoose.model<IPost>("Post", postSchema);

export default postModel;
