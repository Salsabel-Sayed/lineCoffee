import { catchError } from "../errors/catchError";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/appError";
import { Schema } from "mongoose";
import dotenv from "dotenv";
dotenv.config();
interface AuthenticatedRequest extends Request {
  user?: { userId: Schema.Types.ObjectId; role: string; email: string };
}

export const verifyToken = catchError(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const secret = process.env.PASSWORD_TOKEN;
    if (!secret) {
      throw new Error(
        "Missing JWT secret: PASSWORD_TOKEN is not defined in .env"
      );
    }
    const authHeader = req.headers["authorization"];
    if (!authHeader) return next(new AppError("No token provided", 401));

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    if (!token) {
      return next(new AppError("No token provided", 401));
    }

    jwt.verify(token, secret, (err, decoded: any) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return next(new AppError("Token expired", 401));
        } else if (err.name === "JsonWebTokenError") {
          return next(new AppError("Invalid token", 401));
        } else {
          return next(new AppError("Authentication error", 401));
        }
      }

      req.user = {
        userId: decoded.userId,
        role: decoded.role,
        email: decoded.email,
      };
      next();
    });
  }
);
