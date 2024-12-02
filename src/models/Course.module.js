import mongoose,{Schema,model} from "mongoose"

const courseSchema = new Schema ({
    courseTitle : {
        type : String,
        required : true
    },
    subTitle : {
        type : String,
        // required : true
    },
    description : {
        type : String
    },
    category : {
        type : String,
        required : true
    },
    courseLevel : {
        type : String,
        enum : ["beginner" , "medium" , "advance"]
    },
    coursePrice : {
        type : Number,
        // required : true,
    },
    coureseThumbnail : {
        type : String
    },
    enrolledStudents : [
        {
            type : Schema.Types.ObjectId,
            ref : "User"
        }
    ],
    lectures : [
        {
            type : Schema.Types.ObjectId,
            ref : "Lecture"
        }
    ],
    creator : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    isPublished : {
        type : Boolean,
        default : false
    }
},
{
    timestamps : true
}
)
 

export  const Course = model("Course",courseSchema);