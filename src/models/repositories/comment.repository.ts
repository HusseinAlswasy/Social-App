import { Model } from "mongoose";
import { dataBaseRepository } from "./base.repository";
import CommentModel, { IComment } from "../commentModel";

export class commentRepository extends dataBaseRepository<IComment> {
  constructor(public readonly model: Model<IComment> = CommentModel) {
    super(model);
  }
}
