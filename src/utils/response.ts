import { Response } from 'express';

export const sendSuccess = (
  res: Response,
  data: unknown,
  message = 'Berhasil',
  statusCode = 200
) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
};

export const sendError = (
  res: Response,
  message = 'Terjadi kesalahan',
  statusCode = 500,
  errors?: unknown
) => {
  return res.status(statusCode).json({
    status: 'error',
    message,
    ...(errors && { errors }),
  });
};

export const sendPaginated = (
  res: Response,
  data: unknown,
  meta: { page: number; limit: number; total: number },
  message = 'Berhasil'
) => {
  return res.status(200).json({
    status: 'success',
    message,
    data,
    meta: {
      page: meta.page,
      limit: meta.limit,
      total: meta.total,
      totalPages: Math.ceil(meta.total / meta.limit),
    },
  });
};
