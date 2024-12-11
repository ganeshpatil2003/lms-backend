import { Router } from "express";
import { authenticateUser } from "../middelwares/userAuthenticate.middelware.js";
import {
  getAllPurchaseCourses,
  purchaseCourse,
  purchaseCourseDeatils,
} from "../controllers/purchaseCourse.controller.js";
const purchaseRouter = Router();

purchaseRouter
  .route("/purchase-course/:courseId")
  .post(authenticateUser, purchaseCourse)
  .get(authenticateUser, purchaseCourseDeatils);
purchaseRouter
  .route("/getall-purchased-courses")
  .get(authenticateUser, getAllPurchaseCourses);

export { purchaseRouter };
