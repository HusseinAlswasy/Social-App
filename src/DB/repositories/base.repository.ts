import { PopulateOption, PopulateOptions } from "mongoose";
import {
  HydratedDocument,
  Model,
  ProjectionType,
  QueryFilter,
  QueryOptions,
  Types,
  UpdateQuery,
} from "mongoose";

export abstract class dataBaseRepository<TDocument> {
  constructor(public readonly model: Model<TDocument>) {}

  //===============================Create====================================
  async create(data: Partial<TDocument>): Promise<HydratedDocument<TDocument>> {
    return this.model.create(data);
  }
  //===============================FindByID====================================
  async findById(
    id: Types.ObjectId,
  ): Promise<HydratedDocument<TDocument> | null> {
    return this.model.findById(id);
  }
  //===============================FindOne====================================
  async findOne({
    filter,
    options,
    projection,
  }: {
    filter: QueryFilter<TDocument>;
    projection?: ProjectionType<TDocument>;
    options?: QueryOptions<TDocument>;
  }): Promise<HydratedDocument<TDocument> | null> {
    return await this.model
      .findOne(filter, projection)
      .populate(options?.populate as PopulateOptions | PopulateOptions[])
      .select(options?.select as ProjectionType<TDocument>)
      .sort(options?.sort)
      .exec();
  }
  //===============================Find====================================
  async find({
    filter,
    options,
  }: {
    filter: QueryFilter<TDocument>;
    options?: QueryOptions<TDocument>;
  }): Promise<HydratedDocument<TDocument>[] | []> {
    let cursor = this.model.find(filter);
    if (options?.populate) {
      cursor = cursor.populate(
        options.populate as PopulateOptions | PopulateOptions[],
      );
    }
    if (options?.select) {
      cursor = cursor.select(options.select);
    }
    if (options?.sort) {
      cursor = cursor.sort(options.sort);
    }
    if (options?.limit) {
      cursor = cursor.limit(options.limit);
    }
    if (options?.skip) {
      cursor = cursor.skip(options.skip);
    }

    return await cursor.exec();
  }
  //===============================FindOneAndUpdate====================================
  async findOneAndUpdate({
    filter,
    update,
    options,
  }: {
    filter: QueryFilter<TDocument>;
    update: UpdateQuery<TDocument>;
    options?: QueryOptions<TDocument>;
  }): Promise<HydratedDocument<TDocument> | null> {
    return await this.model.findOneAndUpdate(filter, update, {
      new: true,
      runValidators: true,
      ...options,
    });
  }
  //===============================FindOneAndDelete====================================
  async findOneAndDelete({
    filter,
    options,
  }: {
    filter: QueryFilter<TDocument>;
    options?: QueryOptions<TDocument>;
  }): Promise<HydratedDocument<TDocument> | null> {
    return await this.model.findByIdAndDelete(filter, options);
  }
}
