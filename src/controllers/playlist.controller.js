import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"



const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description, videos } = req.body;
    const user = req.user;
    
    if(!user){
        throw new ApiError(401, "Login to your account.")
      }
    if (!name && !description) {
        throw new ApiError(400, 'Name and description is required for creating a playlist');
    }

    // Create a new playlist instance
    const playlist = new Playlist({
        name,
        description,
        owner:user,
        videos // Array of video IDs
    });

    const createdPlaylist = await playlist.save();
    if (!createdPlaylist) {
        throw new ApiError(500, 'Failed to create playlist. Please try again.');
    }

    return res.status(201).json(new ApiResponse(201, 'Playlist created successfully', createdPlaylist));
});


const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, 'Invalid userId');
    }

    const playlists = await Playlist.find({ owner: userId });

    return res.status(200).json(new ApiResponse(200, 'User playlists retrieved successfully', playlists));
});


const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

  
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, 'Invalid playlistId');
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, 'Playlist not found');
    }

    return res.status(200).json(new ApiResponse(200, 'Playlist retrieved successfully', playlist));
});


const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, 'Invalid playlistId or videoId');
    }

   
    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $push: { videos: videoId } },
        { new: true }
    );

    if (!playlist) {
        throw new ApiError(404, 'Playlist not found');
    }

    return res.status(200).json(new ApiResponse(200, 'Video added to playlist successfully', playlist));
});


const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, 'Invalid playlistId or videoId');
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $pull: { videos: videoId } },
        { new: true }
    );

    if (!playlist) {
        throw new ApiError(404, 'Playlist not found');
    }

    return res.status(200).json(new ApiResponse(200, 'Video removed from playlist successfully', playlist));
});


const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, 'Invalid playlistId');
    }

    const playlist = await Playlist.findByIdAndDelete(playlistId);

    if (!playlist) {
        throw new ApiError(404, 'Playlist not found');
    }

    return res.status(200).json(new ApiResponse(200, 'Playlist deleted successfully'));
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, 'Invalid playlistId');
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { name, description },
        { new: true, runValidators: true }
    );

    if (!updatedPlaylist) {
        throw new ApiError(404, 'Playlist not found');
    }

    return res.status(200).json(new ApiResponse(200, 'Playlist updated successfully', updatedPlaylist));
});


export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}