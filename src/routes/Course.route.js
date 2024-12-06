import { Router } from "express";
import {
  createCourse,
  getCourseById,
  getCreatorCourses,
  getPublishedCourses,
  toggelPublishCourse,
  updateCourse,
} from "../controllers/course.controller.js";
import { authenticateUser } from "../middelwares/userAuthenticate.middelware.js";
import { upload } from "../middelwares/multer.middelware.js";

const courseRouter = Router();

courseRouter.route("/create-course").post(authenticateUser, createCourse);

courseRouter.route("/get-courses").get(authenticateUser, getCreatorCourses);

courseRouter
  .route("/update-course/:courseId")
  .patch(authenticateUser, upload.single("courseThumbnail"), updateCourse);

courseRouter
  .route("/get-coursebyid/:courseId")
  .get(authenticateUser, getCourseById);

courseRouter
  .route("/publish-toggel/:courseId")
  .patch(authenticateUser, toggelPublishCourse);

courseRouter
  .route("/getpublished-courses")
  .get(authenticateUser, getPublishedCourses);

export { courseRouter };
