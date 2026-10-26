import { s3Service } from "../../service/s3.service";
import type { NextFunction, Request, Response } from "express";
import AppError from "../../common/middleware/globalErrorHandel.middleware";
import { HydratedDocument, HydrateOptions, Types } from "mongoose";
import redisService from "../../service/redis.service";
import { successResponse } from "../../common/utils/successResponse";
import { NotificationService } from "../../service/notification.service";
import { IRequest } from "../../common/types/request.type";
import { randomUUID } from "crypto";
import { userRepository } from "../../models/repositories/user.repository";
import { commentRepository } from "../../models/repositories/comment.repository";
import { postRepository } from "../../models/repositories/post.repository";
import { PostAvailability } from "../post/post.helper";
import { OnModelEnum } from "../../common/enums/post_enum.js";
import { IPost } from "../../models/postModel.js";
import { IComment } from "../../models/commentModel.js";

const notificationService = new NotificationService();

class CommentServices {
  private readonly _commentModel = new commentRepository();
  private readonly _userModel = new userRepository();
  private readonly _postModel = new postRepository();
  private readonly _s3Service = new s3Service();

  constructor() {}

  //================================ Create Comment =========================================
  createComment = async (req: IRequest, res: Response, next: NextFunction) => {
    const { content, tags, onModel } = req.body;
    const { postId, commentId } = req.params;

    let doc: HydratedDocument<IPost | IComment> | null = null;
    if (onModel === OnModelEnum.Comment && commentId) {
      const comment = await this._commentModel.findOne({
        filter: {
          _id: commentId,
          refId: postId!,
        },
        options: {
          populate: [
            {
              path: "refId",
              match: {
                _id: postId,
                $or: [...PostAvailability(req)],
                allowComment: true,
              },
            },
          ],
        },
      });

      if (!comment?.refId) {
        throw new AppError(
          "comment not found or you are not authorized to comment this post",
          404,
        );
      }

      doc = comment;
    } else if (onModel === OnModelEnum.Post && !commentId) {
      const post = await this._postModel.findOne({
        filter: {
          _id: postId,
          $or: [...PostAvailability(req)],
          allowComment: true,
        },
      });

      if (!post) {
        throw new AppError(
          "post not found or you are not authorized to comment this post",
          404,
        );
      }

      doc = post;
    } else {
      throw new AppError("invalid request", 400);
    }

    let mentions: Types.ObjectId[] = [];
    let fcmTokens: string[] = [];

    if (tags?.length) {
      const data = await this._userModel.find({
        filter: {
          _id: { $in: tags },
        },
      });

      if (data.length !== tags.length) {
        throw new AppError("some tags are not valid", 400);
      }

      for (const tag of data) {
        if (tag._id.toString() === req.user!._id.toString()) {
          throw new AppError("you can not mention to your self", 400);
        }
        mentions.push(tag._id);
        const tokens = await redisService.getFCMs(tag._id);
        fcmTokens.push(...tokens);
      }
    }

    const folderId = randomUUID();
    let urls: string[] = [];

    if (req?.files) {
      urls = await this._s3Service.uploadFiles({
        files: req.files as Express.Multer.File[],
        path: `users/${doc?.createdBy}/posts/${doc?.folderId}/comments/${folderId}`,
      });
    }

    const Comment = await this._commentModel.create({
      content: content || "",
      attachments: urls,
      tags: mentions,
      createdBy: req?.user?._id!,
      folderId,
      refId: doc?._id!,
      onModel,
    });

    if (fcmTokens?.length) {
      Promise.allSettled(
        fcmTokens.map((token) =>
          notificationService.sendToDevice({
            token,
            title: "New Comment",
            body: "Someone mentioned you in a Comment",
          }),
        ),
      );
    }

    successResponse({
      res,
      message: "Action created successfully",
      data: Comment,
      status: 201,
    });
  };
  //================================ Replay Comment =========================================
  // replayComment = async (req: IRequest, res: Response, next: NextFunction) => {
  //   const { content, tags, postId, commentId } = req.body;

  //   const comment = await this._commentModel.findOne({
  //     filter: {
  //       _id: commentId,
  //       postId,
  //     },
  //     options: {
  //       populate: [
  //         {
  //           path: "postId",
  //           match: {
  //             $or: [...PostAvailability(req)], // ← req
  //             allowComment: true,
  //           },
  //         },
  //       ],
  //     },
  //   });

  //   if (!comment?.postId) {
  //     throw new AppError(
  //       "comment not found or you are not authorized to comment this post",
  //       404,
  //     );
  //   }
  //   let mentions: Types.ObjectId[] = [];
  //   let fcmTokens: string[] = [];

  //   if (tags?.length) {
  //     const data = await this._userModel.find({
  //       filter: {
  //         _id: { $in: tags },
  //       },
  //     });

  //     if (data.length !== tags.length) {
  //       throw new AppError("some tags are not valid", 400);
  //     }

  //     for (const tag of data) {
  //       if (tag._id.toString() === req.user!._id.toString()) {
  //         throw new AppError("you can not mention to your self", 400);
  //       }
  //       mentions.push(tag._id);
  //       const tokens = await redisService.getFCMs(tag._id);
  //       fcmTokens.push(...tokens);
  //     }
  //   }

  //   const folderId = randomUUID();
  //   let urls: string[] = [];

  //   if (req?.files) {
  //     urls = await this._s3Service.uploadFiles({
  //       files: req.files as Express.Multer.File[],
  //       path: `users/${req?.user?._id}/posts/${(comment.postId as any).folderId}/comments/${folderId}`,
  //     });
  //   }

  //   const Comment = await this._commentModel.create({
  //     content: content || "",
  //     attachments: urls,
  //     tags: mentions,
  //     createdBy: req?.user?._id!,
  //     folderId,
  //     postId: comment.postId._id,
  //     commentId: comment._id,
  //   });

  //   if (fcmTokens?.length) {
  //     Promise.allSettled(
  //       fcmTokens.map((token) =>
  //         notificationService.sendToDevice({
  //           token,
  //           title: "New Comment",
  //           body: "Someone mentioned you in a Comment",
  //         }),
  //       ),
  //     );
  //   }

  //   successResponse({
  //     res,
  //     message: "Replay created successfully",
  //     data: Comment,
  //     status: 201,
  //   });
  // };
}

export default new CommentServices();
