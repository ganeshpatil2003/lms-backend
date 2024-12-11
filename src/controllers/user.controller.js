import { User } from "../models/User.module.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandeler } from "../utils/AsyncHandeler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/uploadOnCloudinary.js";

const options = {
  httpOnly: true,
  secure: true,
};
const createAccessandRefreshToken = async function (id) {
  const user = await User.findById(id);

  const accessToken = await user.generateAccessToken();

  const refreshToken = await user.generateRefreshToken();

  user.refreshToken = refreshToken;

  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};
const registerUser = asyncHandeler(async (req, res) => {
  const { username, email, password } = req.body;


  if (!(username && email && password)) {
    // throw new ApiError(400, "All fields are required");
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "All fields are required"));
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    // throw new ApiError(400, "User already exist.");
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "User already exist."));
  }

  const createdUser = await User.create({
    username: username.toLowerCase(),
    email,
    password,
  });

  if (!createdUser) {
    // throw new ApiError(400, "Error while creation of user.");
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Error while creation of user."));
  }

  const user = await User.findById(createdUser._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User created successfully."));
});

const loginUser = asyncHandeler(async (req, res) => {
  const { email, password } = req.body;

  if ([email, password].some((field) => field.trim() === "")) {
    // throw new ApiError(400, "All fields are required");
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "All fields are required"));
  }

  const user = await User.findOne({
    email: email,
  });

  if (!user) {
    // throw new ApiError(400, "User does not exist.");
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "User does not exist"));
  }

  const isPasswordcorrect = await user.isPasswordCorrect(password);

  if (!isPasswordcorrect) {
    // throw new ApiError(400, "Password is invalid");
    return res.status(400).json(new ApiResponse(400, {}, "Incorrect Password"));
  }

  const { accessToken, refreshToken } = await createAccessandRefreshToken(
    user._id
  );

  const loginUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, loginUser, "User Loggedin successfully."));
});

const logOutUser = asyncHandeler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: { refreshToken: 1 },
    },
    {
      new: true,
    }
  );
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Loggedout"));
});

const getUserDetails = asyncHandeler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('enrolledCourses').select("-password -refreshToken")
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User details fetched successfully."));
});

const updateUserDetails = asyncHandeler(async (req, res) => {
  const { username } = req.body;

  const avatarLocalPath = req.file?.path;


  if ([username].some((field) => field.trim() === "")) {
    return res
      .status(404)
      .json(new ApiResponse(404, {}, "username or photo is missing."));
  }
  if (req.user.avatar !== "") {
    const publicId = req.user.avatar.split("/").pop().split(".")[0];
    await deleteFromCloudinary(publicId);
  }
  let avatarUploadinfo = null;
  if (avatarLocalPath !== "") {
    avatarUploadinfo = await uploadOnCloudinary(avatarLocalPath);
    if (!avatarUploadinfo?.url) {
      // throw ApiError(404,"photo not uploaded")
      return res
        .status(404)
        .json(new ApiResponse(404, {}, "Error while upload avatar."));
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatarUploadinfo?.url || req.user.avatar,
        username: username,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  if (!user) {
    throw ApiError(404, "user not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile photo uploaded successfully."));
});

export {
  registerUser,
  loginUser,
  logOutUser,
  getUserDetails,
  updateUserDetails,
};
