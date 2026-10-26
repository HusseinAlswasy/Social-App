import postModel from "../../models/postModel";
import { postRepository } from "../../models/repositories/post.repository";
import { s3Service } from "../../service/s3.service";
import { createPostDto, like_unLikeDto } from "./post.validation";
import type { NextFunction, Request, Response } from "express";
import AppError from "../../common/middleware/globalErrorHandel.middleware.js";
import { Types } from "mongoose";
import redisService from "../../service/redis.service.js";
import { successResponse } from "../../common/utils/successResponse.js";
import { NotificationService } from "../../service/notification.service.js";
import { IRequest } from "../../common/types/request.type.js";
import { randomUUID } from "crypto";
import {
  PostAction,
  PostAvailabilityEnum,
} from "../../common/enums/post_enum.js";
import { userRepository } from "../../models/repositories/user.repository.js";
import { PostAvailability } from "./post.helper.js";
import { commentRepository } from "../../models/repositories/comment.repository.js";

const notificationService = new NotificationService();

class PostServices {
  private readonly _postModel = new postRepository();
  private readonly _userModel = new userRepository();
  private readonly _commentModel = new commentRepository();
  private readonly _s3Service = new s3Service();

  constructor() {}

  //================================ Create Post =========================================
  createPost = async (req: IRequest, res: Response, next: NextFunction) => {
    const { content, tags, allowComment, availability }: createPostDto =
      req.body;
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
        path: `users/${req.user!._id}/posts/${folderId}`,
      });
    }

    const post = await this._postModel.create({
      content: content || "",
      attachments: urls,
      allowComment: allowComment as boolean,
      availability: availability as PostAvailabilityEnum,
      tags: mentions,
      createdBy: req.user!._id,
      folderId,
    });

    if (fcmTokens?.length) {
      Promise.allSettled(
        fcmTokens.map((token) =>
          notificationService.sendToDevice({
            token,
            title: "New Post",
            body: "Someone mentioned you in a post",
          }),
        ),
      );
    }

    successResponse({
      res,
      message: "post created successfully",
      data: post,
      status: 201,
    });
  };
  //================================ Get Post =========================================
  getPosts = async (req: IRequest, res: Response, next: NextFunction) => {
    const page = Math.max(Number(req.query.page) || 1, 1);

    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const posts = await this._postModel.find({
      filter: {
        $or: [...PostAvailability(req)],
      },
      options: {
        populate: [
          {
            path: "comments",
            match: { commentId: { $exists: false } },
            populate: [{ path: "replies" }],
          },
        ],
      },

      // options: {
      //   limit,
      //   skip,
      // },
    });

    // let docs = []
    // for (const post of posts) {
    //   const comments = await this._commentModel.find({
    //     filter: {
    //       postId: post._id,
    //       commentId:{$exists:false}
    //     },
    //   });
    //   docs.push({...post.toObject(),comments})
    // }

    // const posts = await this._postModel.paginate({
    //   page,
    //   limit: 3,
    //   search: {
    //     $or: [...PostAvailability(req)],
    //   },
    // });

    successResponse({
      res,
      data: posts,
      message: "Get All Data Successfully",
    });
  };
  //================================ Update Post =========================================
  updatePost = async (req: IRequest, res: Response, next: NextFunction) => {
    const {
      content,
      tags,
      allowComment,
      availability,
      removeFile,
      removeTags,
    } = req.body;
    const { id } = req.params;

    const post = await this._postModel.findOne({
      filter: { _id: id, createdBy: req.user!._id },
    });

    if (!post) {
      throw new AppError(
        "Post not found or you are not authorized to update this post",
        404,
      );
    }

    // ---------- Tags ----------
    const currentTags = new Set(post.tags?.map((t) => t.toString()));
    const newlyAddedTags: string[] = [];

    if (removeTags?.length) {
      removeTags.forEach((tag: string) => currentTags.delete(tag));
    }

    let fcmTokens: string[] = [];

    if (tags?.length) {
      const uniqueTags = [...new Set<string>(tags)];

      const users = await this._userModel.find({
        filter: { _id: { $in: uniqueTags } },
      });

      if (users.length !== uniqueTags.length) {
        throw new AppError("some tags are not valid", 400);
      }

      if (uniqueTags.includes(req.user!._id.toString())) {
        throw new AppError("you can not mention yourself", 400);
      }

      for (const user of users) {
        const userId = user._id.toString();
        if (!currentTags.has(userId)) newlyAddedTags.push(userId);
        currentTags.add(userId);
      }

      const tokensArr = await Promise.all(
        newlyAddedTags.map((uid) =>
          redisService.getFCMs(Types.ObjectId.createFromHexString(uid)),
        ),
      );
      fcmTokens = tokensArr.flat();
    }

    post.tags = [...currentTags].map((t) =>
      Types.ObjectId.createFromHexString(t),
    );

    // ---------- Remove files (memory only, S3 later) ----------
    if (removeFile?.length) {
      const invalidFiles = removeFile.filter(
        (file: string) => !post.attachments?.includes(file),
      );
      if (invalidFiles.length) {
        throw new AppError("some files are not valid", 400);
      }
      post.attachments = (post.attachments || []).filter(
        (file) => !removeFile.includes(file),
      );
    }

    // ---------- Upload new files ----------
    let urls: string[] = [];
    if (Array.isArray(req.files) && req.files.length) {
      urls = await this._s3Service.uploadFiles({
        files: req.files as Express.Multer.File[],
        path: `users/${req.user!._id}/posts/${randomUUID()}`,
      });
      post.attachments = [...(post.attachments || []), ...urls];
    }

    // ---------- Other fields ----------
    if (content !== undefined) post.content = content;
    if (allowComment !== undefined) post.allowComment = allowComment;
    if (availability !== undefined) post.availability = availability;

    // ---------- Save ----------
    try {
      await post.save();
    } catch (error) {
      if (urls.length) await this._s3Service.deleteFiles(urls); // رجّع الصور الجديدة
      throw error;
    }

    // ---------- Delete old files AFTER successful save ----------
    if (removeFile?.length) {
      await this._s3Service.deleteFiles(removeFile);
    }

    successResponse({
      res,
      data: post,
      message: "Updated Post Successfully",
    });
  };
  //================================ Like Post ==========================================
  like_unlike_post = async (
    req: IRequest,
    res: Response,
    next: NextFunction,
  ) => {
    const { id } = req.params;
    const { flag } = req.query;

    const updateQuery =
      flag === PostAction.unLike
        ? { $pull: { likes: req.user!._id } }
        : { $addToSet: { likes: req.user!._id } };

    const post = await this._postModel.findOneAndUpdate({
      filter: {
        $or: [...PostAvailability(req)],
        _id: id,
      },
      update: updateQuery,
    });

    if (!post) {
      throw new AppError(
        "Post not found or you are not authorized to interact with this post",
        404,
      );
    }

    successResponse({
      res,
      data: post,
      message: "Action Made Successfully",
    });
  };
}

export default new PostServices();
