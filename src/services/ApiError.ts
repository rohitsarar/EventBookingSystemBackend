export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public errors?: Record<string, string>[];

  constructor(
    statusCode: number,
    message: string,
    errors?: Record<string, string>[],
    isOperational = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    // Maintains proper stack trace (only for V8 engines)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(message: string, errors?: Record<string, string>[]) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message: string) {
    return new ApiError(401, message);
  }

  static forbidden(message: string) {
    return new ApiError(403, message);
  }

  static notFound(message: string) {
    return new ApiError(404, message);
  }

  static conflict(message: string) {
    return new ApiError(409, message);
  }

  static internal(message: string) {
    return new ApiError(500, message, undefined, false);
  }
}
