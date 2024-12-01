import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

export const uploadOnCloudinary = async (localfilepath) => {
  try {
    if (!localfilepath) return null;
    const response = await cloudinary.uploader.upload(localfilepath, {
      resource_type: "auto",
    });
    fs.unlinkSync(localfilepath)
    // console.log("file has been uploaded successfully !! ",response)
    return response;
  } catch (error) {
    fs.unlinkSync(localfilepath);
    // console.log("error ok ")

    return null;
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.log(error);
  }
};

export const deleteVideoFromClodinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId,{resource_type : "video"})
  } catch (error) {
    console.log(error);
  }
}
