import { Model } from "mongoose";
import userModel, { IUser } from "../../models/userModel";
import { dataBaseRepository } from "./base.repository";

export class userRepository extends dataBaseRepository<IUser> {
  constructor(public readonly model: Model<IUser> = userModel) {
    super(model)
  }
}
