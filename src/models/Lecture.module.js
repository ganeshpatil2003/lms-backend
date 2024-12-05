import mongoose,{Schema,model} from 'mongoose'

const lectureSchema = new Schema(
    {
        lectureTitle : {
            type : String,
            require : true
        },
        videoUrl :{
            type :String
        },
        publicId : {
            type :String
        },
        isPriviewFree : {
            type : Boolean
        },
    },
    {
        timestamps:true
    }
    );

export const Lecture = model('Lecture',lectureSchema)