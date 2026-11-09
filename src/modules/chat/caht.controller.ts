import { Router } from "express";
import US from "./chat.service";
import { Validation } from "../../common/middleware/validation";
import { authentication } from "../../common/middleware/authentication.js";

const chatRouter = Router(<any>{ mergeParams: true });

chatRouter.get("/users", authentication, US.getUsers);
chatRouter.get("/:userId", authentication, US.getChat);


export default chatRouter;
