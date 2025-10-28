import { FilterQuery, UpdateQuery, Document } from 'mongoose';

export interface IBaseRepository<T extends Document> {
  findById(id: string, projection?:string): Promise<T | null>;
  findOne(filter: FilterQuery<T>): Promise<T | null>;
  find(filter: FilterQuery<T>): Promise<T[]>;
  create(item: Partial<T>): Promise<T>;
  update(id: string, update: UpdateQuery<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  findMany(filter?: FilterQuery<T>, projection?: string): Promise<T[]>;
  updateOne(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<T | null>;
  deleteOne(filter: FilterQuery<T>): Promise<boolean>;
}
 