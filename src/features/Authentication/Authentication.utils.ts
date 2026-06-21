import { validationResult, ValidationError } from "express-validator";
import { Request } from "express";
import User, { IUser } from "./user.model";
import { ApiError } from "../../services/ApiError";
import { MESSAGES } from "../../utils/constants";
import { hashPassword, comparePassword } from "../../helper/bcrypt.helper";
import { signToken, TokenPayload } from "../../helper/jwt.helper";

/**
 * Extract express-validator errors into a clean array.
 */
export const extractValidationErrors = (
  req: Request,
): { field: string; message: string }[] => {
  const result = validationResult(req);
  if (result.isEmpty()) return [];
  return result.array().map((err: ValidationError) => ({
    field: (err as any).path ?? "unknown",
    message: err.msg,
  }));
};

/**
 * Create a new user document after hashing password.
 */
export const createUser = async (
  name: string,
  email: string,
  password: string,
): Promise<IUser> => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict(MESSAGES.EMAIL_EXISTS);
  }

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return user;
};

/**
 * Validate credentials and return signed JWT.
 */
export const loginUser = async (
  email: string,
  password: string,
): Promise<{ user: Omit<IUser, "password">; token: string }> => {
  // .select("+password") because password field has select:false
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw ApiError.unauthorized(MESSAGES.INVALID_CREDENTIALS);
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw ApiError.unauthorized(MESSAGES.INVALID_CREDENTIALS);
  }

  const payload: TokenPayload = {
    userId: user._id.toString(),
    email: user.email,
  };

  const token = signToken(payload);

  // Strip password before returning
  const userObj = user.toObject() as any;
  delete userObj.password;

  return { user: userObj, token };
};
