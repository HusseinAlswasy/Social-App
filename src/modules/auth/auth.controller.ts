import { Router } from "express";
import US from "./auth.service";
import { Validation } from "../../common/middleware/validation";
import { signUpSchema } from "./auth.validation";

const userRouter = Router();

userRouter.post("/signUp",Validation(signUpSchema), US.signUp);

userRouter.post("/signIn", US.signIn);

export default userRouter;

