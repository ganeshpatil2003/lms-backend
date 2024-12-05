import { asyncHandeler } from "../utils/AsyncHandeler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Course } from "../models/Course.module.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/uploadOnCloudinary.js";
import { Lecture } from "../models/Lecture.module.js";
import mongoose from "mongoose";

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

const getCreatorCourses = asyncHandeler(async (req, res) => {
  const userId = req.user._id;
  const courses = await Course.find({ creator: userId });

  if (!courses) {
    return res
      .status(400)
      .json(new ApiResponse(400, { courses: [] }, "No courses are found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, courses, "Courses fetched successfully."));
});

const updateCourse = asyncHandeler(async (req, res) => {
  const {
    courseTitle,
    subTitle,
    description,
    category,
    courseLevel,
    coursePrice,
  } = req.body;
  const couresThumbnail = req.file?.path;
  const courseId = req.params.courseId;

  // console.log(courseTitle)
  const course = await Course.findById(courseId);
  if (!course) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Course didn't found."));
  }
  let thumbNail = null;
  if (couresThumbnail) {
    if (course.courseThumbnail) {
      const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
      await deleteFromCloudinary(publicId); //delete whole image
    }
    thumbNail = await uploadOnCloudinary(couresThumbnail);
  }
  const updatedData = {
    courseTitle: courseTitle,
    subTitle: subTitle,
    description: description,
    category: category,
    courseLevel: courseLevel,
    coursePrice: coursePrice,
    courseThumbnail: thumbNail?.secure_url,
  };
  const updatedCourse = await Course.findByIdAndUpdate(
    course._id,

    updatedData,
    { new: true }
  );

  if (!updatedCourse) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Course didn't updated."));
  }
  // console.log(updatedCourse,'=========================>>>>>>>>>>>>>>>>>>>>>>>')
  // console.log("updated data",updatedData)
  // console.log(req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, updatedCourse, "Course Updated successfully."));
});

const getCourseById = asyncHandeler(async (req, res) => {
  const courseId = req.params.courseId;
  const course = await Course.findById(courseId);
  if (!course) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Course did not found"));
  }
  return res
    .status(200)
    .json(new ApiResponse(200, course, "Course fetched successfully."));
});

//.............................................................Lecture controllers.................................................................

const createLecture = asyncHandeler(async (req, res) => {
  const { lectureTitle } = req.body;
  const { courseId } = req.params;
  // console.log(lectureTitle, courseId);
  // console.log(req.body)
  if (!(lectureTitle && courseId)) {
    {
      return res
        .status(400)
        .json(
          new ApiResponse(400, {}, "Course id or Course title are required")
        );
    }
  }
  const lecture = await Lecture.create({
    lectureTitle,
  });
  if (!lecture) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Error while lecture creation"));
  }
  const course = await Course.findByIdAndUpdate(
    courseId,
    {
      $push: {
        lectures: lecture._id,
      },
    },
    {
      new: true,
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, lecture, "Lecture created."));
});

const getCourseLectures = asyncHandeler(async (req, res) => {
  const {courseId} = req.params;
  const course = await Course.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(courseId),
      },
    },
    {
      $lookup: {
        from: "lectures",
        foreignField: "_id",
        localField: "lectures",
        as: "lectures",
      },
    },
    {
      $addFields: {
        totalLectures: {
          $size: "$lectures",
        },
      },
    },
    {
      $project : {
        lectures : 1,
        totalLectures : 1,
        courseTitle : 1,
      }
    }
  ]);
  console.log(course);
  if (!course)
    return res.status(400).json(new ApiResponse(400, {}, "Lectures not found"));
  return res
    .status(200)
    .json(new ApiResponse(200, course, "Lectures fetched successfully"));
});

const updateLecture = asyncHandeler(async(req,res) => {
  const videoLocalPath = req.file?.path;
  const {lectureTitle,isPriviewFree} = req.body;
})
export {
  createCourse,
  getCreatorCourses,
  updateCourse,
  getCourseById,
  createLecture,
  getCourseLectures
};
