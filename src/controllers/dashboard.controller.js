import mongoose, { mongo } from "mongoose";
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
  

})


const getChannelVideos = asyncHandler(async (req, res) => {
  

})

export {
  getChannelStats,
  getChannelVideos
}