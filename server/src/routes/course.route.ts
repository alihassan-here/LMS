import express from 'express';
import { uploadCourse } from '../controllers/course.controller';
import { authorizeRole, isAuthenticated } from '../middleware/auth';
const courseRouter = express.Router();

courseRouter.post("/create-course", isAuthenticated, authorizeRole("admin"), uploadCourse);

export default courseRouter;