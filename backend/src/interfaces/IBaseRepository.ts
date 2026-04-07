/**
 * IBaseRepository<T> — Generic Repository Interface
 * 
 * Defines the contract for all data-access repositories.
 * Follows Interface Segregation Principle (ISP) by keeping the interface
 * focused on core CRUD operations.
 * 
 * Follows Dependency Inversion Principle (DIP) — services depend on
 * this abstraction, not concrete Mongoose models.
 */
export interface IBaseRepository<T> {
  findById(id: string): Promise<T | null>;
  findOne(filter: Record<string, any>): Promise<T | null>;
  findAll(filter?: Record<string, any>): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  count(filter?: Record<string, any>): Promise<number>;
}

/**
 * IPaginatedResult<T> — Standardized pagination response
 */
export interface IPaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * IQueryOptions — Common query parameters
 */
export interface IQueryOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
  populate?: string | string[];
}
