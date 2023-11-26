import { Response } from "express";
import { redis } from "../src/utils/redis";

//GET USER BY ID
export const getUserByID = async (id: string, res: Response) => {
    const userJSON = await redis.get(id);
    if (userJSON) {
        const user = JSON.parse(userJSON);
        res.status(200).json({ success: true, user });
    }
}