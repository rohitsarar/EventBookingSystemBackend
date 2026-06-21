import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS, MESSAGES } from "../../utils/constants";
import { sendSuccess } from "../../helper/response.helper";
import { ApiError } from "../../services/ApiError";
import {
  extractValidationErrors,
  createUser,
  loginUser,
} from "./Authentication.utils";

/**
 * POST /api/auth/register
 * Register a new user.
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Validate inputs
    const errors = extractValidationErrors(req);
    if (errors.length > 0) {
      throw ApiError.badRequest(MESSAGES.VALIDATION_ERROR, errors);
    }

    const { name, email, password } = req.body;

    const user = await createUser(name, email, password);

    sendSuccess({
      res,
      statusCode: HTTP_STATUS.CREATED,
      message: MESSAGES.USER_REGISTERED,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Login with email & password, returns JWT.
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const errors = extractValidationErrors(req);
    if (errors.length > 0) {
      throw ApiError.badRequest(MESSAGES.VALIDATION_ERROR, errors);
    }

    const { email, password } = req.body;

    const { user, token } = await loginUser(email, password);

    sendSuccess({
      res,
      statusCode: HTTP_STATUS.OK,
      message: MESSAGES.USER_LOGIN,
      data: {
        token,
        user: {
          id: (user as any)._id,
          name: (user as any).name,
          email: (user as any).email,
          role: (user as any).role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Return the currently authenticated user's profile.
 */
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // req.user is attached by the auth middleware
    const user = (req as any).user;

    sendSuccess({
      res,
      statusCode: HTTP_STATUS.OK,
      message: "Profile fetched successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
