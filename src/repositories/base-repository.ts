import { Document, Model, FilterQuery, UpdateQuery } from 'mongoose';
import { IBaseRepository } from '../interfaces/i-base-repository';
import { injectable } from 'inversify';

@injectable()
export class BaseRepository<T extends Document> implements IBaseRepository<T> {
  private _model: Model<T>;

  constructor(model: Model<T>) {
    this._model = model;
  }

async findById(id: string, projection: string = ''): Promise<T | null> {
  return this._model.findById(id).select(projection).exec();
}

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this._model.findOne(filter).exec();
  }

  async find(filter: FilterQuery<T>): Promise<T[]> {
    return this._model.find(filter).exec();
  }

  async create(item: Partial<T>): Promise<T> {
    const created = new this._model(item);
    return created.save();
  }

  async update(id: string, update: UpdateQuery<T>): Promise<T | null> {
    return this._model.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this._model.findByIdAndDelete(id).exec();
    return !!result;
  }

  async findMany(filter: FilterQuery<T> = {}, projection = ''): Promise<T[]> {
    return await this._model.find(filter, projection).lean<T[]>().exec();
  }

  async updateOne(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<T | null> {
    return await this._model.findOneAndUpdate(filter, update, { new: true }).lean<T>().exec();
  }

  async deleteOne(filter: FilterQuery<T>): Promise<boolean> {
    const result = await this._model.deleteOne(filter);
    return result.deletedCount === 1;
  }
} 