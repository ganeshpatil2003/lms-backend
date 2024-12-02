import { asyncHandeler } from "../utils/AsyncHandeler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Course } from "../models/Course.module.js";
const createCourse = asyncHandeler(async (req, res) => {
  const { courseTitle, category } = req.body;
  if (!(courseTitle && category)) {
    return res
      .status(400)
      .json(
        new ApiResponse(400, {}, "Course title and category are required.")
      );
  }
  const course = await Course.create({
    courseTitle,
    category,
    creator: req.user._id,
  });
  if (!course) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Error while creation of course"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, course, "Course created successfully."));
});

export { createCourse };
