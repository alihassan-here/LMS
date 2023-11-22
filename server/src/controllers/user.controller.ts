require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import UserModel from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncErrors } from "../middleware/catchAsyncErrors";
import jwt, { Secret } from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";

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