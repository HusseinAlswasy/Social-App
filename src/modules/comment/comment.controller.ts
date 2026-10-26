import { Router } from "express";
import PS from "./comment.service";
import multerCloud from "../../common/middleware/multerCloude";
import * as PV from "./comment.validation.js";
import { Validation } from "../../common/middleware/validation.js";
import { authentication } from "../../common/middleware/authentication.js";

const commentRouter = Router({mergeParams:true});

commentRouter.post(
  "/",
  authentication,
  multerCloud({}).array("attachments"),
  Validation(PV.commentSchema),
  PS.createComment,
);

commentRouter.post(
  "/:commentId/replay",
  authentication,
  multerCloud({}).array("attachments"),
  Validation(PV.commentSchema),
  PS.createComment,
);

export default commentRouter;
