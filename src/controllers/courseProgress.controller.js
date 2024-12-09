import { CourseProgress } from "../models/CourseProgress.module.js";
import { Course } from "../models/Course.module.js";
import { asyncHandeler } from "../utils/AsyncHandeler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const getCourseProgress = asyncHandeler(async (req, res) => {
  const { courseId } = req.params;
  const { user } = req;
  // step-1 find the courseprogress on the courseid and userid
  const courseProgress = await CourseProgress.findOne({
    courseId: courseId,
    userId: user._id,
  }).populate(courseId);
  const course = await Course.findById(courseId).populate("lectures");
  //step-2 if not courseprogress ,return course details with empty array
  if (!courseProgress) {
    // console.log("course not found")
    return res.status(200).json(
      new ApiResponse(200, {
        lectureProgress: [],
        courseId,
        completed: false,
        course,
      })
    );
  }
  //step-3 return users coursedetails with progress
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        courseProgress,
        "Fetched successfully courseprogress"
      )
    );
});

const updateLectureProgress = asyncHandeler(async (req, res) => {
  const { courseId, lectureId } = req.params;
  const id = req.user._id;
  const course = await Course.findById(courseId).populate("lectures");
  let courseProgress = await CourseProgress.findOne({
    courseId: courseId,
    userId: id,
  });

  if (!courseProgress) {
    courseProgress = new CourseProgress({
      courseId,
      userId: id,
      completed: false,
      lectureProgress: [],
      course: null,
    });
  }
  if (courseProgress.lectureProgress.length === 0) {
    course.lectures.forEach((lecture) =>
      courseProgress.lectureProgress.push({
        lectureId: lecture._id,
        viewed: false,
      })
    );
  }
  const lectureIndex = courseProgress.lectureProgress.findIndex(
    (lecture) => lecture._id === lectureId
  );

  if (lectureIndex !== -1) {
    // lecture exist then update the its status
    courseProgress.lectureProgress[lectureIndex].viewed = true;
  } else {
    //add new progress
    courseProgress.lectureProgress.push({
      lectureId,
      viewed: true,
    });
  }

  // if all lectures are already complete

  const lectureProgressLength = courseProgress.lectureProgress.filter(
    (lecture) => lecture.viewed === true
  );

  // console.log(course.lectures)
  if (course.lectures.length === lectureProgressLength.length) {
    courseProgress.completed = true;
  }
  courseProgress.course = {
    ...course.toObject(), // Convert the Mongoose document to a plain object
  };

  await courseProgress.save();
//   console.log(courseProgress.course.lectures)

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Lecture progress updated"));
});

const markAsComplete = asyncHandeler(async (req, res) => {
  const { courseId } = req.params;
  // console.log('complete process',userId)
  const userId = req.user._id;

  const courseProgress = await CourseProgress.findOne({ courseId, userId });

  if (!courseProgress)
    return res
      .status(404)
      .json(new ApiResponse(404, {}, "Course progress not found"));

  courseProgress.lectureProgress.forEach((lecture) => {
    lecture.viewed = true;
  });

  courseProgress.completed = true;

  await courseProgress.save();

  return res.status(200).json(new ApiResponse(200, {}, "Course completed."));
});

const markAsInComplete = asyncHandeler(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id;
  const courseProgress = await CourseProgress.findOne({ courseId, userId });

  if (!courseProgress)
    return res
      .status(404)
      .json(new ApiResponse(404, {}, "Course progress not found"));

  courseProgress.lectureProgress.map((lecture) => (lecture.viewed = false));

  courseProgress.completed = false;

  await courseProgress.save();

  return res.status(200).json(new ApiResponse(200, {}, "Course in completed."));
});

export {
  updateLectureProgress,
  getCourseProgress,
  markAsInComplete,
  markAsComplete,
};
