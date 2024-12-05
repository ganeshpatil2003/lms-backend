import { Router } from "express";
import { createLecture, getCourseLectures } from "../controllers/course.controller.js";
import { authenticateUser } from "../middelwares/userAuthenticate.middelware.js";
import{upload} from "../middelwares/multer.middelware.js"
const lectureRouter = Router();

lectureRouter.route('/create-lecture/:courseId').post(authenticateUser,upload.none(),createLecture)

lectureRouter.route('/get-lectures/:courseId').get(authenticateUser,getCourseLectures)

export{lectureRouter}