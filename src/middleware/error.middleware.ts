import { Request, Response, NextFunction } from "express";
import { ApiError } from "../services/ApiError";
import { verifyToken } from "../helper/jwt.helper";
import { MESSAGES } from "../utils/constants";
import User from "../features/Authentication/user.model";
import { sendError } from "../helper/response.helper";

/**
 * JWT Authentication Middleware.
 * Attaches req.user on success.
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw ApiError.unauthorized(MESSAGES.UNAUTHORIZED);
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw ApiError.unauthorized(MESSAGES.UNAUTHORIZED);
    }

    // Verify token (throws on expired/invalid)
    const decoded = verifyToken(token);

    // Check user still exists in DB
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      throw ApiError.unauthorized(MESSAGES.USER_NOT_FOUND);
    }

    // Attach user to request
    (req as any).user = user;
    next();
  } catch (error: any) {
    // Handle JWT-specific errors gracefully
    if (error.name === "TokenExpiredError") {
      next(ApiError.unauthorized(MESSAGES.TOKEN_EXPIRED));
    } else if (error.name === "JsonWebTokenError") {
      next(ApiError.unauthorized(MESSAGES.TOKEN_INVALID));
    } else {
      next(error);
    }
  }
};

/**
 * Role-based authorization middleware.
 * Usage: authorize("admin")
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      next(
        ApiError.forbidden("You do not have permission to perform this action"),
      );
      return;
    }
    next();
  };
};

/**
 * 404 Not Found handler — attach after all routes.
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
};

/**
 * Global Error Handler — must be the LAST middleware.
 */
export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Operational errors (ApiError) — known, safe to expose
  if (err instanceof ApiError) {
    sendError({
      res,
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  // Mongoose duplicate key error
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue || {})[0] || "field";
    sendError({
      res,
      statusCode: 409,
      message: `${field} already exists`,
    });
    return;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values((err as any).errors).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
    sendError({
      res,
      statusCode: 422,
      message: MESSAGES.VALIDATION_ERROR,
      errors,
    });
    return;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    sendError({
      res,
      statusCode: 400,
      message: "Invalid ID format",
    });
    return;
  }

  // Unknown / programming error — don't leak details
  console.error("💥 Unhandled error:", err);
  sendError({
    res,
    statusCode: 500,
    message: MESSAGES.INTERNAL_ERROR,
  });
};
