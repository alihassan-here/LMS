require("dotenv").config();
import express, { Request, Response, NextFunction } from "express";
export const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from "../src/middleware/error";
import userRouter from "./routes/user.route";
import courseRouter from "./routes/course.route";


//BODY PARSER
app.use(express.json({ limit: "50mb" }));

//COOKIE PARSER
app.use(cookieParser());

//CORS => CROSS ORIGIN RESOURCE SHARING
app.use(cors({
    origin: process.env.ORIGIN
}));

//TESTING API
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        success: true,
        message: "test successful"
    })
});


//ROUTES
app.use("/api/v1", userRouter);
app.use("/api/v1", courseRouter);
//UNKNOWN ROUTES
app.all("*", (req: Request, res: Response, next: NextFunction) => {
    const err = new Error(`Route ${req.originalUrl} not found`) as any;
    err.statusCode = 404;
    next(err);
});

app.use(ErrorMiddleware)