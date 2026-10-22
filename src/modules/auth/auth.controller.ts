import { Router } from "express";
import US from "./auth.service";
import { Validation } from "../../common/middleware/validation";
import { signInSchema, signUpSchema } from "./auth.validation";
import multerCloud from "../../common/middleware/multerCloude";

const userRouter = Router();

userRouter.post("/signUp", Validation(signUpSchema), US.signUp);

userRouter.post("/signIn", Validation(signInSchema), US.signIn);

userRouter.post(
  "/upload",
  multerCloud({}).array("attachments"),
  US.uploadFiles,
);

userRouter.get("/getFile/*path",US.getFile)

userRouter.post("/upload/pre-signed-url",US.preSignedFile)

userRouter.get("/upload/get/pre-signed-url/*path",US.getPreSignedFile)

userRouter.get("/getAllFiles",US.getAllFiles)

userRouter.get("/deleteFile/*path",US.deleteFile)

userRouter.delete("/deleteFiles",US.deleteFiles)

userRouter.delete("/deleteFolder",US.deleteFolder)



export default userRouter;
