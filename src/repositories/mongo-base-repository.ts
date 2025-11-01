import { Document, Model, FilterQuery, UpdateQuery } from 'mongoose';
import { IMongoBaseRepository } from '../interfaces/i-mongo-base-repository';
import { injectable } from 'inversify';

@injectable()
export class MongoBaseRepository<T extends Document> implements IMongoBaseRepository<T> {
  private _model: Model<T>;

  constructor(model: Model<T>) {
    this._model = model;
  }

  async findById(id: string, projection: string = ''): Promise<T | null> {
    try {
      return await this._model.findById(id).select(projection).exec();
    } catch (error) {
      console.error('Error in findById:', error);
      return null;
    }
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    try {
      return await this._model.findOne(filter).exec();
    } catch (error) {
      console.error('Error in findOne:', error);
      return null;
    }
  }

  async find(filter: FilterQuery<T>): Promise<T[] | null> {
    try {
      return await this._model.find(filter).exec();
    } catch (error) {
      console.error('Error in find:', error);
      return null;
    }
  }

  async create(item: Partial<T>): Promise<T | null> {
    try {
      const created = new this._model(item);
      return await created.save();
    } catch (error) {
      console.error('Error in create:', error);
      return null;
    }
  }

  async update(id: string, update: UpdateQuery<T>): Promise<T | null> {
    try {
      return await this._model.findByIdAndUpdate(id, update, { new: true }).exec();
    } catch (error) {
      console.error('Error in update:', error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this._model.findByIdAndDelete(id).exec();
      return !!result;
    } catch (error) {
      console.error('Error in delete:', error);
      return false;
    }
  }

  async findMany(filter: FilterQuery<T> = {}, projection = ''): Promise<T[] | null> {
    try {
      return await this._model.find(filter, projection).lean<T[]>().exec();
    } catch (error) {
      console.error('Error in findMany:', error);
      return null;
    }
  }

  async updateOne(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<T | null> {
    try {
      return await this._model.findOneAndUpdate(filter, update, { new: true }).lean<T>().exec();
    } catch (error) {
      console.error('Error in updateOne:', error);
      return null;
    }
  }

  async deleteOne(filter: FilterQuery<T>): Promise<boolean> {
    try {
      const result = await this._model.deleteOne(filter);
      return result.deletedCount === 1;
    } catch (error) {
      console.error('Error in deleteOne:', error);
      return false;
    }
  }
}
