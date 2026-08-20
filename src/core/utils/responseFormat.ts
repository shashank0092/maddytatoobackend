export const successResponse = <T>(data: T) => {
  return {
    success: true,
    data,
  };
};

export const listResponse = <T, M = unknown>(data: T[], meta: M) => {
  return {
    success: true,
    data,
    meta,
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
