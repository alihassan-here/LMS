require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import UserModel, { IUser } from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncErrors } from "../middleware/catchAsyncErrors";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";
import userModel from "../models/user.model";
import { accessTokenOptions, refreshTokenOptions, sendToken } from "../utils/jwt";
import { redis } from "../utils/redis";
import { getUserByID } from "../../services/user.service";

interface IRegistrationBody {
    name: string;
    email: string;
    password: string;
    avatar?: string;
}

export const register = CatchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password, avatar } = req.body;
        const isEmailExist = await UserModel.findOne({ email });
        if (isEmailExist) {
            return next(new ErrorHandler(400, "Email already exists"));
        }
        const user: IRegistrationBody = {
            name,
            email,
            password,
        }

        const activationToken = createActivationToken(user);
        const activationCode = activationToken.activationCode;
        const data = { user: { name: user.name, }, activationCode };
        const html = await ejs.renderFile(path.join(__dirname, "../mails/activation-mail.ejs"), data);

        await sendMail({
            email: user.email,
            subject: "Activate your account",
            "template": "activation-mail.ejs",
            data
        })

        res.status(201).json({
            success: true,
            message: `Please check your email: ${user.email} to activate your account!`,
            activationToken: activationToken.token,
        })
    } catch (error: any) {
        return next(new ErrorHandler(400, error.message))
    }
});

interface IActivationToken {
    token: string;
    activationCode: string;
}

export const createActivationToken = (user: any): IActivationToken => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const token = jwt.sign({ user, activationCode }, process.env.ACTIVATION_SECRET as Secret, { expiresIn: "5m" });

    return { token, activationCode };
}

// ACTIVATE USER
interface IActivationRequest {
    activation_token: string;
    activation_code: string;
}

export const activateUser = CatchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { activation_token, activation_code } = req.body as IActivationRequest;
        const newUser: { user: IUser, activationCode: string } = jwt.verify(activation_token, process.env.ACTIVATION_SECRET as string) as { user: IUser; activationCode: string };
        if (newUser.activationCode !== activation_code) {
            return next(new ErrorHandler(400, "Invalid activation code"));
        }
        const { name, email, password } = newUser.user;
        const existUser = await userModel.findOne({ email });
        if (existUser) {
            return next(new ErrorHandler(400, "Email already exists"));
        }
        const user = await userModel.create({ name, email, password });
        res.status(201).json({
            success: true
        })
    } catch (error: any) {
        return next(new ErrorHandler(400, error.message));
    }
});

//LOGIN USER
interface ILoginRequest {
    email: string;
    password: string;
}

export const login = CatchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body as ILoginRequest;
        if (!email || !password) {
            return next(new ErrorHandler(400, "Please enter email and password"));
        }
        const user = await userModel.findOne({ email }).select("+password");
        if (!user) {
            return next(new ErrorHandler(400, "Invalid email or password"));
        }
        const isPasswordMatch = user.comparePassword(password);
        if (!isPasswordMatch) {
            return next(new ErrorHandler(400, "Invalid email or password"));
        }
        sendToken(user, 200, res);
    } catch (error: any) {
        return next(new ErrorHandler(400, error.message));
    }
});

// LOGOUT USER
export const logout = CatchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.cookie("access_token", "", { maxAge: 1 });
        res.cookie("refresh_token", "", { maxAge: 1 });
        const userId = req.user?._id || ""
        redis.del(userId);
        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        })
    } catch (error: any) {
        return next(new ErrorHandler(400, error.message));
    }
});

//UPDATE ACCESS TOKEN
export const updateAccessToken = CatchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refresh_token = req.cookies.refresh_token as string;
        const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN as string) as JwtPayload;
        const message = "Could not refresh token";
        if (!decoded) {
            return next(new ErrorHandler(400, message));
        }
        const session = await redis.get(decoded.id as string);
        if (!session) {
            return next(new ErrorHandler(400, message));
        }
        const user = JSON.parse(session);
        const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN as string, {
            expiresIn: "5m"
        });
        const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN as string, { expiresIn: "3d" });
        res.cookie("access_token", accessToken, accessTokenOptions);
        res.cookie("refresh_token", refreshToken, refreshTokenOptions);
        res.status(200).json({ success: true, accessToken });
    } catch (error: any) {
        return next(new ErrorHandler(400, error.message));
    }
});

// GET USER INFO
export const getUserInfo = CatchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?._id;
        getUserByID(userId, res);
    } catch (error: any) {
        return next(new ErrorHandler(400, error.message));
    }
})