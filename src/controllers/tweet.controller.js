import { isValidObjectId } from "mongoose";
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
  
    if (!user) {
      throw new ApiError(401, "Unauthorized: User not logged in.");
    }

    if (!isValidObjectId(tweetId)) {
      throw new ApiError(400, "Invalid tweet ID");
    }
  
    if (!content) {
      throw new ApiError(400, "Tweet content is required.");
    }
  
    const tweetToUpdate = await Tweet.findOneAndUpdate(
      { _id: tweetId, owner: user._id },
      { content },
      { new: true } // Return the updated tweet
    );
  
    if (!tweetToUpdate) {
      throw new ApiError(404, "Tweet not found or you are not authorized to update it.");
    }
    res.json(new ApiResponse(200, "Tweet updated successfully", tweetToUpdate));
  });
  
const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const tweets = await Tweet.find({ owner: user });

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "User tweets retrieved successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const user = req.user;
  const { tweetId } = req.params;

  if (!user) {
    throw new ApiError(401, "Unauthorized: User not logged in.");
  }

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  const tweetToDelete = await Tweet.findOneAndDelete({
    _id: tweetId,
    owner: user._id,
  });

  if (!tweetToDelete) {
    throw new ApiError(404, "Tweet not found or you are not authorized to delete it.");
  }

  res.json(new ApiResponse(200, "Tweet deleted successfully"));
});

export { createTweet,
   getUserTweets,
    updateTweet, 
    deleteTweet 
  };
