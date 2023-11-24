import { Response } from "express";
import userModel from "../src/models/user.model"

//GET USER BY ID
export const getUserByID = async (id: string, res: Response) => {
    const user = await userModel.findById(id);
    res.status(200).json({ success: true, user });
}