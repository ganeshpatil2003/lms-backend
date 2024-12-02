import {Router} from "express"
import { createCourse } from "../controllers/course.controller.js";
import { authenticateUser } from "../middelwares/userAuthenticate.middelware.js";

const courseRouter = Router();

courseRouter.route('/create-course').post(authenticateUser,createCourse)



export {courseRouter}