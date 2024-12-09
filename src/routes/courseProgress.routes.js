import { Router } from "express";
import { authenticateUser } from "../middelwares/userAuthenticate.middelware.js";
import {
  getCourseProgress,
  markAsComplete,
  markAsInComplete,
  updateLectureProgress,
} from "../controllers/courseProgress.controller.js";
const processRouter = Router();

processRouter.route("/:courseId").get(authenticateUser, getCourseProgress);

processRouter
  .route("/:courseId/:lectureId/update")
  .post(authenticateUser, updateLectureProgress);

processRouter 
  .route("/:courseId/mark-complete")
  .patch(authenticateUser, markAsComplete);

processRouter
  .route("/:courseId/mark-incomplete")
  .patch(authenticateUser, markAsInComplete);

export { processRouter };
