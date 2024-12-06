import { Router } from "express";
import { createLecture, getCourseLectures, removeLecture, updateLecture,getLectureById } from "../controllers/course.controller.js";
import { authenticateUser } from "../middelwares/userAuthenticate.middelware.js";
import{upload} from "../middelwares/multer.middelware.js"
const lectureRouter = Router();

lectureRouter.route('/create-lecture/:courseId').post(authenticateUser,upload.none(),createLecture)

lectureRouter.route('/get-lectures/:courseId').get(authenticateUser,getCourseLectures)

lectureRouter.route('/update-lecture/:courseId/:lectureId').patch(authenticateUser,updateLecture)

lectureRouter.route('/remove-lecture/:lectureId').delete(authenticateUser,removeLecture)

lectureRouter.route('/getlecturebyid/:lectureId').get(authenticateUser,getLectureById)

export{lectureRouter}