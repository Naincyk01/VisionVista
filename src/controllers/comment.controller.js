import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js";


const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const user = req.user;
    const content = req.body?.content;

    if (!content || !videoId || !user) {
        throw new ApiError(400, "Content, videoId, and user information are required.");
    }

    const video = await Video.findById(videoId);
    const newcomment = await Comment.create({
        content,
        video,
        owner: user,
      });

      const addComment = await Comment.findById(newcomment._id);
      if (!addComment) {
        throw new ApiError(500, "Something went wrong while adding the comment");
      }

    res.json(new ApiResponse(201, "Comment added successfully"));
});



const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const newcomment  = req.body?.content;
   
    if (!commentId || !newcomment) {
        throw new ApiError(400, "Comment ID and content are required.");
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { content:newcomment},
        { new: true }
    );

    if (!updatedComment) {
        throw new ApiError(404, "Comment not found.");
    }

    res.status(200).json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
});


const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params; 

    
    if (!commentId) {
        throw new ApiError(400, "Comment ID is required.");
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId, {new: true});

    if (!deletedComment) {
        throw new ApiError(404, "Comment not found.");
    }

   return res
   .status(200)
   .json(new ApiResponse(200, "Comment deleted successfully"));
});




export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment,
    }