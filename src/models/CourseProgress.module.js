import mongoose,{Schema,model} from 'mongoose'

const lectureProgressSchema = new Schema({
    lectureId : {
        type : String,
    },
    viewed : {
        type : Boolean
    }
})

const courseProgressSchema = new Schema({
    userId : {
        type : String
    },
    courseId : {
        type :String
    },
    completed : {
        type : Boolean,
    },
    lectureProgress : [
        lectureProgressSchema
    ],
    course : {
        type : Object
    }
})
mongoose.set('strictPopulate', false);

export const CourseProgress = model('CourseProgress',courseProgressSchema)