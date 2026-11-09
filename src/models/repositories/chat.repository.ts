import { Model } from "mongoose";
import { dataBaseRepository } from "./base.repository";
import ChatModel, { IChat } from "../chatModel";

export class ChatRepository extends dataBaseRepository<IChat> {
  constructor(public readonly model: Model<IChat> = ChatModel) {
    super(model);
  }
}
