export const successResponse = <T>(data: T) => {
  return {
    success: true,
    data,
  };
};

export const listResponse = <T>(data: T[], page: number, limit: number, total: number) => {
  return {
    success: true,
    data,
    meta: {
      page,
      limit,
      total,
    },
  };
};

export const errorResponse = (code: string, message: string, details?: unknown) => {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  };
};
