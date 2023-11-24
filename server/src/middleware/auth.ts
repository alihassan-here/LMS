import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from "express";
import { CatchAsyncErrors } from "./catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import { redis } from '../utils/redis';

export const isAuthenticated = CatchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const access_token = req.cookies.access_token;
    if (!access_token) {
        return next(new ErrorHandler(400, "Please login to access this resource."));
    }
    const decoded = await jwt.verify(access_token, process.env.ACCESS_TOKEN as string) as JwtPayload;
    if (!decoded) {
        return next(new ErrorHandler(400, "access token is not valid."));
    }
    const user = await redis.get(decoded.id);
    if (!user) {
        return next(new ErrorHandler(400, "user not found."));
    }
    req.user = JSON.parse(user);
    next();
});

// VALIDATE USER ROLE
export const authorizeRole = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler(403, `Role ${req.user.role} is not allowed to access this resource`));
        }
        next();
    }
}