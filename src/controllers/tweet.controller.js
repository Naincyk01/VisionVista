import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const user = req.user;
  const { content } = req.body;

  if (!user) {
    throw new ApiError(401, "Unauthorized: User not logged in.");
  }
  if (!content) {
    throw new ApiError(400, "Tweet content is required.");
  }

  const newtweet = await Tweet.create({
    content,
    owner: user._id,
  });

  if (!newtweet) {
    throw new ApiError(500, "Something went wrong while adding the tweet");
  }

  res
    .status(201)
    .json(new ApiResponse(201, "Tweet created successfully"));
});


const updateTweet = asyncHandler(async (req, res) => {
    const user = req.user;
    const { tweetId } = req.params;
    const { content } = req.body;
  
    // Check if user is authenticated
    if (!user) {
      throw new ApiError(401, "Unauthorized: User not logged in.");
    }
  
    // Check if tweetId is a valid ObjectId
    if (!isValidObjectId(tweetId)) {
      throw new ApiError(400, "Invalid tweet ID");
    }
  
    // Check if content is provided
    if (!content) {
      throw new ApiError(400, "Tweet content is required.");
    }
  
    // Find the tweet by tweetId and owner (user)
    const tweetToUpdate = await Tweet.findOneAndUpdate(
      { _id: tweetId, owner: user._id },
      { content },
      { new: true } // Return the updated tweet
    );
  
    // Check if tweetToUpdate is null (no tweet found or not authorized to update)
    if (!tweetToUpdate) {
      throw new ApiError(404, "Tweet not found or you are not authorized to update it.");
    }
  
    // Respond with success message and updated tweet
    res.json(new ApiResponse(200, "Tweet updated successfully", tweetToUpdate));
  });
  

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
});

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
  });

export { createTweet, getUserTweets, updateTweet, deleteTweet };
