import { asyncHandeler } from "../utils/AsyncHandeler.js";
import { Course } from "../models/Course.module.js";
import { PurchaseCourse } from "../models/PurchaseCourse.module.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Lecture } from "../models/Lecture.module.js";
import { User } from "../models/User.module.js";
import mongoose from "mongoose";
const purchaseCourse = asyncHandeler(async (req, res) => {
  const { courseId } = req.params;
  const { user } = req;
    // console.log(user)
  const course = await Course.findById(courseId);
  const purchasCourse = await PurchaseCourse.create({
    courseId: course._id,
    userId: user._id,
    amount: course.coursePrice,
    status: "completed",
  });
  if (!purchasCourse)
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Fail to purchase course"));

  course.enrolledStudents.push(user._id);
  await course.save();
  await purchasCourse.populate("courseId");
    // console.log(purchasCourse)
  if (purchasCourse.courseId && purchasCourse.courseId.lectures.length > 0) {
    const lectures = await Lecture.updateMany(
      { _id: { $in: purchasCourse.courseId.lectures } },
      { $set: { isPriviewFree: true } }
    );
    console.log(course)
  }
  const user2 = await User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        $push: {
          enrolledCourses: purchasCourse.courseId._id,
        },
      },
    },
    {
      new: true,
    }
  );
  // console.log(user2)
  return res.status(200).json( new ApiResponse(200,{},"Course purchased"));
});

const purchaseCourseDeatils = asyncHandeler(async(req,res) => {
    const {courseId} =req.params;
    const {user} = req;
    const course = await Course.aggregate([
      {
        $match : {
          _id : new mongoose.Types.ObjectId(courseId)
        }
      },
      {
        $lookup : {
          from : "users",
          localField : "creator",
          foreignField : "_id",
          as : "creator",
          pipeline:[
            {
              $project : {
                username : 1,
              }
            }
          ]
        }
      },
      {
        $lookup : {
          from : "lectures",
          localField: 'lectures',
          foreignField:'_id',
          as : "lectures",
          pipeline:[
            {
              $project : {
                lectureTitle : 1,
                videoUrl : 1,
                isPriviewFree : 1,
              }
            }
          ]
        }
      },
      // {
      //   $lookup : {
      //     from : "users",
      //     localField: "enrolledStudents",
      //     foreignField : "_id",
      //     as: "enrolledStudents"
      //   }
      // },
      {
        $addFields : {
          creator : {
            $first : "$creator",
          }
        }
      },
      {
        $project : {
          creator : 1,
          lectures:1,
          description : 1,
          coursePrice:1,
          updatedAt : 1,
          enrolledStudents:1,
          subTitle:1,
        }
      }
    ])
    const purchase = await PurchaseCourse.findOne({courseId,userId:user._id})
    if(!course)return res.status(404).json(new ApiResponse(404,{},"Course didn't found."))
    return res.status(200).json(new ApiResponse(200,{course:course[0],purchase : purchase ? true : false},"Course fetched."))
})


export {purchaseCourse,purchaseCourseDeatils}