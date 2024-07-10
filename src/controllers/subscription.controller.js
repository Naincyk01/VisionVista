import {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import mongoose from "mongoose"


const toggleSubscription = asyncHandler(async (req, res) => {
  const {  channelId } = req.params;
  const user = req.user;

  if (!isValidObjectId( channelId)) {
    throw new ApiError(400, "Invalid  channelId");
}

  if(!user){
    throw new ApiError(404, "Unauthorized.");
  }

  const channel = await User.findById( channelId);

  if(!channel){
    throw new ApiError(404, "No channel found");
  }

  const existingSubscribed = await Subscription.findOne({channel, subscriber: user})

  if(existingSubscribed){
    await Subscription.findByIdAndDelete(existingSubscribed._id);
    return res
      .status(200)
      .json(new ApiResponse(200, "Channel is unsubscribed successfully"));
  }
  else{
    const newsubscribed = await Subscription.create({
      subscriber: user,
      channel
    })

    if(!newsubscribed){
      throw new ApiError(500, "Something went wrong while subscribing the channel");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Channel subscribed"))
  }   
})



//controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
      throw new ApiError(400, "Invalid channelId");
  }

  const channel = await User.findById(channelId);

  if (!channel) {
      throw new ApiError(404, "Channel not found");
  }

  // Find all subscriptions where the channel matches
  const subscribers = await Subscription.find({ channel });

  // Extract only the subscribers from the subscriptions
  const subscriberList = subscribers.map(subscription => subscription.subscriber);

  return res.status(200).json(new ApiResponse(200, "List of subscribers", subscriberList));
});

// const getUserChannelSubscribers = asyncHandler(async (req, res) => {
//   const { channelId } = req.params;

//   if(!mongoose.isValidObjectId(channelId)){
//     throw new ApiError(404, "Invalid channel id")
//   }

//   const channel = await User.findById(channelId);

//   if(!channel){
//     throw new ApiError(404, "No channel found");
//   }

//   const subscribers = await Subscription.find({channel}).populate('subscriber').exec();

//   if(!subscribers){
//     throw new ApiError(500, "Something went wrong while fetching subscribers list");
//   }

//   return res
//     .status(200)
//     .json(new ApiResponse(200, subscribers, "Subscribers list fetched successfuly"));

// })



// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
      throw new ApiError(400, "Invalid subscriberId");
  }

  const user = await User.findById(subscriberId);

  if (!user) {
      throw new ApiError(404, "User not found");
  }

  const subscriptions = await Subscription.find({ subscriber: user });

  // Extract only the channels from the subscriptions
  const channelList = subscriptions.map(subscription => subscription.channel);

  return res.status(200).json(new ApiResponse(200, "List of subscribed channels", channelList));
});


// const getSubscribedChannels = asyncHandler(async (req, res) => {
//   const { subscriberId } = req.params;

//   if(!mongoose.isValidObjectId(subscriberId)){
//     throw new ApiError(404, "Invalid subscriber id");
//   }

//   const user = await User.findById(subscriberId);

//   if(!user){
//     throw new ApiError(404, "No such user found");
//   }

//   const subscribedChannels = await Subscription.find({ subscriber: user }).populate('subscriber').populate('channel').exec();
//   // const subscribedChannels = await Subscription.find({ subscriber: user });

//   if(!subscribedChannels){
//     throw new ApiError(500, "Something went wrong while fetching the subscribed channels list");
//   }

//   return res
//     .status(200)
//     .json(new ApiResponse(200, subscribedChannels, "Subscribed channel list fetched successfuly"));

// })


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}