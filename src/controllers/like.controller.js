import {isValidObjectId} from "mongoose";
import {Like} from "../models/like.model.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js"
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js"


const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const user = req.user;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    if (!user) {
        throw new ApiError(401, "Login to your account to like videos");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    const alreadyLike = await Like.findOne({ video: video._id, likedBy: user._id });

    if (alreadyLike) {
        await Like.findByIdAndDelete(alreadyLike._id);
        return res.json(new ApiResponse(200, "Video is unliked"));
    } else {
        const newLike = await Like.create({ video: video._id, likedBy: user._id });
        if (!newLike) {
            throw new ApiError(500, "Something went wrong when liking the video");
        }
        return res.json(new ApiResponse(200, "Video is liked"));
    }
});


const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params   
    const user = req.user;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentId");
    }

    if (!user) {
        throw new ApiError(401, "Login to your account to like comment");
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }
    const alreadyLike = await Like.findOne({ comment: comment._id, likedBy: user._id });

    if (alreadyLike) {
        await Like.findByIdAndDelete(alreadyLike._id);
        return res.json(new ApiResponse(200, "Comment is unliked"));
    } else {
        const newLike = await Like.create({ comment: comment._id, likedBy: user._id });
        if (!newLike) {
            throw new ApiError(500, "Something went wrong when liking the comment");
        }
        return res.json(new ApiResponse(200, "Comment is liked"));
    }
});


const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params   
    const user = req.user;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId");
    }

    if (!user) {
        throw new ApiError(401, "Login to your account to like tweet");
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }
    const alreadyLike = await Like.findOne({ tweet: tweet._id, likedBy: user._id });

    if (alreadyLike) {
        await Like.findByIdAndDelete(alreadyLike._id);
        return res.json(new ApiResponse(200, "Tweet is unliked"));
    } else {
        const newLike = await Like.create({ tweet: tweet._id, likedBy: user._id });
        if (!newLike) {
            throw new ApiError(500, "Something went wrong when liking the tweet");
        }
        return res.json(new ApiResponse(200, "Tweet is liked"));
    }
});


const getLikedVideos = asyncHandler(async (req, res) => {
    const user = req.user;

    if (!user) {
        throw new ApiError(401, "Login to view liked videos");
    }

   // Find all likes by the user
    const likedVideos = await Like.find({ likedBy: user._id, video: { $exists: true } }).populate('video');

    // Extract video information from likedVideos array
    const videos = likedVideos.map(like => like.video);

    // Send response with the list of liked videos
    return res.json(new ApiResponse(200,videos, "Liked videos fetched successfully"));
});

// const getLikedVideos = asyncHandler(async (req, res) => {
//     const user = req.user;
  
//     const likedVideos = await Like.find({ likedBy: user, video: {$exists: true, $ne: null} })
//     // const likedVideos = await Like.find({ likedBy: user, video: {$exists: true, $ne: null} }).populate('video').exec()
//     // const likedVideos = await Like.find({ likedBy: user, video: {$exists: true, $ne: null} }).populate('video') // without exec it will work but it is prefered to use exec
  
//     if(!likedVideos){
//       throw new ApiError(500, "Something went wrong while fetching liked videos")
//     }
  
//     return res
//       .status(200)
//       .json(new ApiResponse(200, likedVideos, "liked video fetched successfuly"))
  
//   })

 export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
 }