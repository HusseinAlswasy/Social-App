import { HydratedDocument, Model } from "mongoose";

export class dataBaseRepository<TDocument> {
  constructor(public readonly model: Model<TDocument>) {}

  async create(data: Partial<TDocument>): Promise<HydratedDocument<TDocument>> {
    return this.model.create(data);
  }
}
