import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";


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


const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  const user = await req.user;
  if (!user) {
    throw new ApiError(401, "Unauthorized: User not logged in to get videos.");
  }

  let videosQuery = Video.find();
  if (userId) {
    videosQuery = videosQuery.where('owner').equals(new mongoose.Types.ObjectId(userId));
  }
  const videos = await videosQuery.exec();

  if (!videos) {
    throw new ApiError(500, "Something went wrong while fetching videos.");
  }

const message = videos.length === 0 ? "No videos found" : "Videos fetched successfully";
const response = new ApiResponse(200, videos, message);


return res
.status(200)
.json(response);
});


const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
      throw new ApiError(400, "Invalid videoId. Must be a valid ObjectId.");
    }
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "video fetched successfully"));
});


const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "videoId parameter is required.");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid videoId. Must be a valid ObjectId.");
  }

  const deletedVideo = await Video.findByIdAndDelete(videoId);

  if (!deletedVideo) {
    throw new ApiError(404, "Video not found or already deleted.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Video deleted successfully"));
});


const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params
 
  const videoLocalPath = req.file?.path;

  if (!videoLocalPath) {
    throw new Error(404, "Video File is missing");
  }
  const videoLink = await uploadOnCloudinary(videoLocalPath);

  if (!videoLink) {
    throw new ApiError(500, "Error while you are uploading the video");
  }
  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        videoFile: videoLink?.url,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video is successfully updated"));
 });


const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid videoId. Must be a valid ObjectId.");
  }
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found.");
  }

  const publishCheck = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: req.body.isPublished || !video.isPublished,
      },
    },
    { new: true }
  );

  const message = publishCheck.isPublished
    ? "Video is successfully published"
    : "Video is successfully unpublished";

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        publishCheck,
       message
      )
    );
});


export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus
};