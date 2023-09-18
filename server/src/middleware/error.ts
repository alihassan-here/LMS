import { Request, Response, NextFunction } from 'express';
import ErrorHandler from "../utils/ErrorHandler";

export const ErrorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";
    if (err.name === "CastError") {
        const message = `Resource not found: ${err.path}`;
        err = new ErrorHandler(404, message);
    }
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err = new ErrorHandler(404, message)
    }
    if (err.name === "JsonWebTokenError") {
        const message = `JSON Web Token is invalid, please try again`;
        err = new ErrorHandler(404, message)
    }
    if (err.name === "TokenExpiredError") {
        const message = `JSON Web Token is expired, please try again`;
        err = new ErrorHandler(404, message)
    }
    res.status(err.statusCode).json({
        success: false,
        message: err.message
    })
}
