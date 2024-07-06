import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "Unauthorized: User not logged in.");
  }


  if (!req.files || !req.files.videoFile || !req.files.thumbnail) {
    throw new ApiError(400, "Both video file and thumbnail are required.");
  }
  const videoFileLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailFileLocalPath = req.files?.thumbnail[0]?.path;

  if (!videoFileLocalPath) {
    throw new ApiError(400, "Video file is required.");
  }

  if (!thumbnailFileLocalPath) {
    throw new ApiError(400, "Thumbnail file is required.");
  }

  const videoUrl = await uploadOnCloudinary(videoFileLocalPath);
  const thumbnailUrl = await uploadOnCloudinary(thumbnailFileLocalPath);
 


  if (!videoUrl || !thumbnailUrl) {
    throw new ApiError(400, "Failed to upload video or thumbnail to Cloudinary.");
}

  const newVideo = await Video.create({
    videoFile: videoUrl.url,
    thumbnail: thumbnailUrl?.url,
    title: title,
    description: description,
    duration: videoUrl?.duration,
    isPublished: false,
    owner: user,
  });
  
  if (!newVideo) {
    throw new ApiError(500, "Something went wrong while uploading the video");
  }
  const createdVideo = await Video.findById(newVideo._id);
  if (!createdVideo) {
    throw new ApiError(500, "Something went wrong while uploading the video");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdVideo, "Video Successfully uploaded"));
});

export { publishAVideo };
