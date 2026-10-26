import { Model } from "mongoose";
import postModel, { IPost } from "../postModel";
import { dataBaseRepository } from "./base.repository";

export class postRepository extends dataBaseRepository<IPost> {
  constructor(public readonly model: Model<IPost> = postModel) {
    super(model);
  }
}
