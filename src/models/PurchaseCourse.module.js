import mongoose,{Schema,model} from 'mongoose'

const purchaseCourseSchema = new Schema({
    courseId : {
        type:Schema.Types.ObjectId,
        ref : 'Course',
        require:true,
    },
    userId : {
        type : Schema.Types.ObjectId,
        ref:'User',
        require:true
    },
    amount : {
        type:Number,
        require : true
    },
    status : {
        type : String,
        enum : ['pending','completed','failed'],
        default:'pending'
    },
    paymentId  :{
        type : String,
        require  :true
    }
})

export const PurchaseCourse = model('PurchaseCourse',purchaseCourseSchema)