import { Model } from "mongoose";
import postModel, { IPost } from "../../models/postModel";
import { dataBaseRepository } from "./base.repository";

export class postRepository extends dataBaseRepository<IPost> {
  constructor(public readonly model: Model<IPost> = postModel) {
    super(model)
  }
}
