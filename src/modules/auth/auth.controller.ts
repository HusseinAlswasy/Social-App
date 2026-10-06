import { Router } from "express";
import US from "./auth.service";
import { Validation } from "../../common/middleware/validation";
import { signUpSchema } from "./auth.validation";
import multerCloud from "../../common/middleware/multerCloude";

const userRouter = Router();

userRouter.post("/signUp", Validation(signUpSchema), US.signUp);

userRouter.post("/signIn", US.signIn);

userRouter.post(
  "/upload",
  multerCloud({}).array("attachments"),
  US.uploadFiles,
);
export default userRouter;
