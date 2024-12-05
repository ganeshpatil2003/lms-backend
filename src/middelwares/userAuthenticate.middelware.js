import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandeler } from "../utils/AsyncHandeler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/User.module.js";

export const authenticateUser = asyncHandeler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      // throw ApiError(400,"unauthorized request.")
      return res
        .status(400)
        .json(new ApiResponse(400, {}, "Unauthorized Req."));
    }
    
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);

    const user = await User.findById(decodedToken?._id).select(
      "-refreshToken -password"
    );

    if (!user) {
      // throw new ApiError(400,"Unauthorized user")
      return res
        .status(400)
        .json(new ApiResponse(400, {}, "Unauthorized user"));
    }
    req.user = user;
    next();
  } catch (error) {
    next(new ApiError(401, error?.message || "Unauthorized user."));
  }
});
