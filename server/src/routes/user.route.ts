import express from 'express';
import { activateUser, getUserInfo, login, logout, register, socialAuth, updateAccessToken } from '../controllers/user.controller';
import { isAuthenticated } from '../middleware/auth';
const userRouter = express.Router();

userRouter.post("/registration", register);
userRouter.post("/activate-user", activateUser);
userRouter.post("/login", login);
userRouter.get("/logout", isAuthenticated, logout);
userRouter.get("/refresh", updateAccessToken);
userRouter.get("/me", isAuthenticated, getUserInfo);
userRouter.post("/social-auth", socialAuth);

export default userRouter;