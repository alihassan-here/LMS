import { Response, } from "express";
import CourseModel from "../src/models/course.model";
import { CatchAsyncErrors } from "../src/middleware/catchAsyncErrors";

export const createCourse = CatchAsyncErrors(async (data: any, res: Response) => {
    const course = await CourseModel.create(data);
    res.status(201).json({
        success: true,
        course
    });
});