import { PaginationMeta } from './pagination.types';

export const parsePaginationQuery = (page: number = 1, limit: number = 20) => {
  const skip = (page - 1) * limit;
  return { page, limit, skip, take: limit };
};

interface MetaInput {
  page: number;
  limit: number;
  total: number;
}

export const createPaginationMeta = ({ page, limit, total }: MetaInput): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};
