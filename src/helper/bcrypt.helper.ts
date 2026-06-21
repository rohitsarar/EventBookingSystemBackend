import bcrypt from "bcryptjs";
import { BCRYPT_SALT_ROUNDS } from "../utils/constants";

/**
 * Hash a plain-text password.
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
};

/**
 * Compare a plain-text password against a stored hash.
 */
export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};
