import mongoose, { Types } from "mongoose";
import { OnModelEnum } from "../common/enums/post_enum.js";

export interface IComment {
  content: string;
  attachments?: string[];
  folderId?: string;
  createdBy: Types.ObjectId;
  refId: Types.ObjectId;
  onModel: OnModelEnum;
  tags?: Types.ObjectId[];
  likes?: Types.ObjectId[];
}

const CommentSchema = new mongoose.Schema<IComment>(
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
    refId: {
      type: Types.ObjectId,
      required: true,
      refPath: "onModel",
    },
    onModel: {
      type: String,
      enum: OnModelEnum,
    },
    tags: {
      type: [mongoose.Types.ObjectId],
      ref: "User",
    },
    likes: {
      type: [mongoose.Types.ObjectId],
      ref: "User",
    },
  },
  {
    timestamps: true,
    strictQuery: true,
   toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

CommentSchema.virtual("replies", {
  ref: "Comment",
  localField: "_id",
  foreignField: "refId",
});

const CommentModel =
  mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);

export default CommentModel;
