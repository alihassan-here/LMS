import express from 'express';
import { activateUser, register } from '../controllers/user.controller';
const userRouter = express.Router();

userRouter.post("/registration", register);
userRouter.post("/activate-user", activateUser);

export default userRouter;