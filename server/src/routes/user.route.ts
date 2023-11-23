import express from 'express';
import { activateUser, login, logout, register } from '../controllers/user.controller';
import { isAuthenticated } from '../middleware/auth';
const userRouter = express.Router();

userRouter.post("/registration", register);
userRouter.post("/activate-user", activateUser);
userRouter.post("/login", login);
userRouter.get("/logout", isAuthenticated, logout);

export default userRouter;