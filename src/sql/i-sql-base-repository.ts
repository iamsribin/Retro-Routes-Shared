import { DeepPartial } from "typeorm";
export interface ISqlBaseRepository<T> {
  findOne(where: Partial<T>): Promise<T | null>;
  findAll(where?: Partial<T>): Promise<T[] | null>;
  create(data: DeepPartial<T>): Promise<T | null>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  findById(id: string): Promise<T | null>;
}
