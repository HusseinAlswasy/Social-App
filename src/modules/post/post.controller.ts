import { Router } from "express";
import PS from "./post.service";
import multerCloud from "../../common/middleware/multerCloude";
import * as PV from "./post.validation.js";
import { Validation } from "../../common/middleware/validation.js";
import { authentication } from "../../common/middleware/authentication.js";
import commentRouter from "../comment/comment.controller.js";


const postRouter = Router();

postRouter.use("/:postId/comments",commentRouter)

postRouter.post("/createPost",authentication,multerCloud({}).array("attachments"),Validation(PV.postSchema),PS.createPost)

postRouter.get("/getPosts",authentication,PS.getPosts)

postRouter.patch("/updatePost/:id",authentication,multerCloud({}).array("attachments"),Validation(PV.updatePostSchema),PS.updatePost)

postRouter.patch("/like_unlike/:id",authentication,Validation(PV.like_unLike_Schema),PS.like_unlike_post)


export default postRouter;
