import { JwtPayload } from "jsonwebtoken";
import { HydratedDocument } from "mongoose";
import { IUser } from "../../models/userModel.js";
import { Request } from "express";

export interface IRequest extends Request {
  user?: HydratedDocument<IUser>;
  decode?: JwtPayload;
}
