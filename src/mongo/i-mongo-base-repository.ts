import { FilterQuery, UpdateQuery, Document } from 'mongoose';

export interface IMongoBaseRepository<T extends Document> {
  findById(id: string, projection?:string): Promise<T | null>;
  findOne(filter: FilterQuery<T>): Promise<T | null>;
  find(filter: FilterQuery<T>): Promise<T[] | null>;
  create(item: Partial<T>): Promise<T| null>;
  update(id: string, update: UpdateQuery<T>): Promise<T | null>;
  delete(id: string): Promise<boolean | null>;
  findMany(filter?: FilterQuery<T>, projection?: string): Promise<T[]| null>;
  updateOne(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<T | null>;
  deleteOne(filter: FilterQuery<T>): Promise<boolean>;
}
 