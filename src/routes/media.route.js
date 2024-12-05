import {Router} from 'express'
import { authenticateUser } from '../middelwares/userAuthenticate.middelware.js';
import {upload} from '../middelwares/multer.middelware.js'
import { uploadOnCloudinary } from '../utils/uploadOnCloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const mediaRouter = Router();

mediaRouter.route('/upload-video').post(upload.single('file'),async(req,res) => {
    try {
        const result = await uploadOnCloudinary(req.file.path);
        // console.log()
         return res.status(200)
         .json(
            new ApiResponse(200,result,'File uploaded successfully.')
         )
    } catch (error) {
        console.log(error)
        return res.status(400)
        .json(
            new ApiResponse(400,{},'Error while uploading file')
        )
    }
})

export {mediaRouter}