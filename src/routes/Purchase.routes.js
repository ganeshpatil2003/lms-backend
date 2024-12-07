import { Router } from "express";
import { authenticateUser } from "../middelwares/userAuthenticate.middelware.js";
import {
  purchaseCourse,
  purchaseCourseDeatils,
} from "../controllers/purchaseCourse.controller.js";
const purchaseRouter = Router();

purchaseRouter
  .route("/purchase-course/:courseId")
  .post(authenticateUser, purchaseCourse)
  .get(authenticateUser, purchaseCourseDeatils);

export { purchaseRouter };
