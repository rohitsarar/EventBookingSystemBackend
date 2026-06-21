import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";
import { JWT_EXPIRES_IN } from "../utils/constants";

export interface TokenPayload {
  userId: string;
  email: string;
}

/**
 * Sign a JWT token with the user payload.
 */
export const signToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_SECRET as string;
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, secret, options);
};

/**
 * Verify and decode a JWT token.
 * Throws if invalid or expired.
 */
export const verifyToken = (token: string): TokenPayload & JwtPayload => {
  const secret = process.env.JWT_SECRET as string;
  return jwt.verify(token, secret) as TokenPayload & JwtPayload;
};
