import {Router} from "express"
import { getUserDetails, loginUser, logOutUser, registerUser, updateUserDetails } from "../controllers/user.controller.js";
import { authenticateUser} from "../middelwares/userAuthenticate.middelware.js";
import{upload} from "../middelwares/multer.middelware.js"

const userRouter = Router();

userRouter.route('/register').post(registerUser);

userRouter.route('/login-user').post(loginUser);

userRouter.route('/get-user').get(authenticateUser,getUserDetails);

userRouter.route('/logout-user').get(authenticateUser,logOutUser);

userRouter.route('/update-user').patch(authenticateUser,upload.single("avatar"),updateUserDetails)

export {userRouter}