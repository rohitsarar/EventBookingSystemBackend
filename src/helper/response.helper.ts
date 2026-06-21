import { Response } from "express";

interface SuccessResponseOptions<T> {
  res: Response;
  statusCode?: number;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
}

interface ErrorResponseOptions {
  res: Response;
  statusCode?: number;
  message: string;
  errors?: Record<string, string>[];
}

/**
 * Send a standardised success JSON response.
 */
export const sendSuccess = <T>({
  res,
  statusCode = 200,
  message,
  data,
  meta,
}: SuccessResponseOptions<T>): void => {
  res.status(statusCode).json({
    success: true,
    message,
    data: data ?? null,
    ...(meta && { meta }),
  });
};

/**
 * Send a standardised error JSON response.
 */
export const sendError = ({
  res,
  statusCode = 500,
  message,
  errors,
}: ErrorResponseOptions): void => {
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && errors.length > 0 && { errors }),
  });
};
