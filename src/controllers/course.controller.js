import { asyncHandeler } from "../utils/AsyncHandeler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Course } from "../models/Course.module.js";
import {
  deleteFromCloudinary,
  deleteVideoFromClodinary,
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
  // console.log(courseId)
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

//toggel Publish course

const toggelPublishCourse = asyncHandeler(async (req, res) => {
  const { courseId } = req.params;
  const { publish } = req.query;

  const course = await Course.findById(courseId);
  if (!course) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Course didn't found."));
  }

  course.isPublished = publish === "true";
  await course.save();
  const statusMessage = course.isPublished ? "Published" : "Unpublished";

  return res.status(200).json(new ApiResponse(200, course, statusMessage));
});

const getPublishedCourses = asyncHandeler(async (req, res) => {
  const courses = await Course.aggregate([
    {
      $match: {
        isPublished: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "creator",
        foreignField: "_id",
        as: "creator",
        pipeline: [
          {
            $project: {
              username: 1,
              email: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        creator: {
          $first: "$creator",
        },
      },
    },
  ]);
  if (!courses) {
    return res.status(404).json(new ApiResponse(404, {}, "No courses found"));
  }
  console.log(courses);
  return res
    .status(200)
    .json(new ApiResponse(200, courses, "Courses fetched successfully."));
});

const createSearchCourse = asyncHandeler(async (req, res) => {
  const { query = "", categories = [], sortByPrice = "" } = req.query;

  // create seach query
  const searchOptions = {
    isPublished: true,
    $or: [
      { courseTitle: { $regex: query, $options: "i" } },
      { subTitle: { $regex: query, $options: "i" } },
      { category: { $regex: query, $options: "i" } },
    ],
  };

  if (categories.length > 0) {
    searchOptions.category = { $in: categories };
  }
  //define sorting order
  const sortOptions = {};
  if (sortByPrice === "low") {
    sortOptions.coursePrice = 1; // ascending order
  } else if (sortByPrice === "high") {
    sortOptions.coursePrice = -1; // descending
  }

  const courses = await Course.find(searchOptions)
    .populate({ path: "creator", select: "username avatar" })
    .sort(sortOptions);

  res
    .status(200)
    .json(
      new ApiResponse(200, courses || [], "Search result fetched successfully.")
    );
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
  const { courseId } = req.params;
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
      $project: {
        lectures: 1,
        totalLectures: 1,
        courseTitle: 1,
      },
    },
  ]);
  console.log(course);
  if (!course)
    return res.status(400).json(new ApiResponse(400, {}, "Lectures not found"));
  return res
    .status(200)
    .json(new ApiResponse(200, course, "Lectures fetched successfully"));
});

const updateLecture = asyncHandeler(async (req, res) => {
  const { lectureId, courseId } = req.params;
  const { lectureTitle, isPriviewFree, videoInfo } = req.body;
  console.log(
    lectureTitle,
    "lecturetitle/n",
    isPriviewFree,
    "videoinfo/n",
    videoInfo
  );
  // console.log(lectureTitle,isPriviewFree,videoInfo)
  const lecture = await Lecture.findById(lectureId);
  if (!lecture) {
    return res
      .status(404)
      .json(new ApiResponse(404, {}, "Lecture not updated"));
  }
  if (videoInfo !== null) {
    if (videoInfo?.videoUrl !== null) lecture.videoUrl = videoInfo.videoUrl;
    if (videoInfo.publicId !== null) lecture.publicId = videoInfo.publicId;
  }

  if (isPriviewFree === false || true) lecture.isPriviewFree = isPriviewFree;
  if (lectureTitle) lecture.lectureTitle = lectureTitle;
  await lecture.save();

  const course = await Course.findById(courseId);
  if (course && !course.lectures.includes(lecture._id)) {
    course.lectures.push(lecture._id);
    await course.save();
  }
  console.log(lecture);
  return res
    .status(200)
    .json(new ApiResponse(200, lecture, "Lecture updated."));
});

const removeLecture = asyncHandeler(async (req, res) => {
  const { lectureId } = req.params;
  const lecture = await Lecture.findByIdAndDelete(lectureId); // delete lecture from mongodb
  if (lecture.publicId) await deleteVideoFromClodinary(publicId); // remove video from cloudinary
  const course = await Course.updateOne(
    { lectures: lectureId }, // finds the lectures id in lectures array
    {
      $pull: { lectures: lectureId }, // remove the lectures id from lectures array
    }
  );
  if (!lecture) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Lecture didn't deleted"));
  }
  console.log(lecture);
  return res
    .status(200)
    .json(new ApiResponse(200, lecture, "Lecture removed."));
});

const getLectureById = asyncHandeler(async (req, res) => {
  const { lectureId } = req.params;
  const lecture = await Lecture.findById(lectureId);
  if (!lecture) {
    return res.status(404).json(404, {}, "Lecture not found");
  }
  // console.log(lecture)
  return res
    .status(200)
    .json(new ApiResponse(200, lecture, "Lecture fetched succssfully."));
});

export {
  createCourse,
  getCreatorCourses,
  updateCourse,
  getCourseById,
  toggelPublishCourse,
  getPublishedCourses,
  createLecture,
  getCourseLectures,
  updateLecture,
  removeLecture,
  getLectureById,
  createSearchCourse
};
