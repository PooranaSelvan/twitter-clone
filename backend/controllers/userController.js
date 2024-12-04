import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";

export const getUserProfile = async (req, res) => {

	// getting username
	const { username } = req.params;

	try {
		// finding user with username 
		// getting user data except password
		const user = await User.findOne({ username }).select("-password");

		// if user not found.
		if (!user) return res.status(404).json({ message: "User not found" });

		res.status(200).json(user);
	} catch (error) {
		console.log("Error in getUserProfile: ", error.message);
		res.status(500).json({ error: error.message });
	}
};


export const getUserData = async (req, res) => {
	try {
	  const { id } = req.params;
   
	  // Fetch user data
	  const user = await User.findById(id); // Use findById method
	  if (!user) {
	    return res.status(404).send({ message: 'User not found' });
	  }
   
	  res.status(200).send(user);
	} catch (error) {
	  console.error(error);
	  res.status(500).send({ message: 'Server error' });
	}
};



export const followUnfollowUser = async (req, res) => {
	try {

		// getting user id.
		const { id } = req.params;

		// finding user by userId which need to unfollow 
		const userToModify = await User.findById(id);
		
		// finding user by your user id
		const currentUser = await User.findById(req.user._id);

		// if your userId is equal return err.
		if (id === req.user._id.toString()) {
			return res.status(400).json({ error: "You can't follow/unfollow yourself" });
		}

		// if otherUser is not found.
		if (!userToModify || !currentUser) return res.status(400).json({ error: "User not found" });

		// check if the user is following that user or not.
		const isFollowing = currentUser.following.includes(id);

		// if userFollows
		if (isFollowing) {
			// Unfollow the user
			await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
			await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

			res.status(200).json({ message: "User unfollowed successfully" });
		} else {
			// if userNotFollows
			// Follow the user
			await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
			await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
			// Send notification to the user
			const newNotification = new Notification({
				type: "follow",
				from: req.user._id,
				to: userToModify._id,
			});

			await newNotification.save();

			res.status(200).json({ message: "User followed successfully" });
		}
	} catch (error) {
		console.log("Error in followUnfollowUser: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

export const getSuggestedUsers = async (req, res) => {
	try {
		// console.log(req);
		const userId = req.user._id;

		const usersFollowedByMe = await User.findById(userId).select("following");

		const users = await User.aggregate([
			{
				$match: {
					_id: { $ne: userId },
				},
			},
			{ $sample: { size: 10 } },
		]);

		const filteredUsers = users.filter((user) => !usersFollowedByMe.following.includes(user._id));
		const suggestedUsers = filteredUsers.slice(0, 4);

		suggestedUsers.forEach((user) => (user.password = null));

		res.status(200).json(suggestedUsers);
	} catch (error) {
		console.log("Error in getSuggestedUsers: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

export const updateUser = async (req, res) => {

	// getting datas from frontend
	const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;
	let { profileImg, coverImg } = req.body;
	const userId = req.user._id;

	try {
		// finding users by userID
		let user = await User.findById(userId);

		// if user not found:
		if (!user) return res.status(404).json({ message: "User not found" });

		// comparing current & new password
		if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
			return res.status(400).json({ error: "Please provide both current password and new password" });
		}

		// if current password & new Password is same
		if (currentPassword && newPassword) {
			const isMatch = await bcrypt.compare(currentPassword, user.password);
			if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });
			if (newPassword.length < 6) {
				return res.status(400).json({ error: "Password must be at least 6 characters long" });
			}
			
			// else update the password to db.
			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(newPassword, salt);
		}

		// updating profileImg to cloudinary
		if (profileImg) {
			// deleting old
			if (user.profileImg) {
				await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
			}

			// upload new.
			const uploadedResponse = await cloudinary.uploader.upload(profileImg);
			profileImg = uploadedResponse.secure_url;
		}

		// updating coverImg to cloudinary
		if (coverImg) {

			// deleting old
			if (user.coverImg) {
				await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
			}

			// uploading new.
			const uploadedResponse = await cloudinary.uploader.upload(coverImg);
			coverImg = uploadedResponse.secure_url;
		}

		// updating got datas.
		user.fullName = fullName || user.fullName;
		user.email = email || user.email;
		user.username = username || user.username;
		user.bio = bio || user.bio;
		user.link = link || user.link;
		user.profileImg = profileImg || user.profileImg;
		user.coverImg = coverImg || user.coverImg;

		// saving in db
		user = await user.save();

		// password should be null in response - for protecting
		user.password = null;

		return res.status(200).json(user);
	} catch (error) {
		console.log("Error in updateUser: ", error.message);
		res.status(500).json({ error: error.message });
	}
};


export const searchUsers = async (req, res) => {
	const { query } = req.body; // Get the search query from the body
 
	if (!query || query.trim().length === 0) {
	    return res.status(400).json({ error: "Search query is required" });
	}
 
	try {
	    // Trim whitespace and perform a case-insensitive regex search for substrings
	    const users = await User.find({
		   username: { $regex: query.trim(), $options: "i" } // Case-insensitive search
	    }).select("fullName username profileImg");
 
	    if (users.length === 0) {
		   return res.status(404).json({ message: "No users found" });
	    }
 
	    res.status(200).json(users);
	} catch (error) {
	    console.log("Error in searchUsers: ", error.message);
	    res.status(500).json({ error: error.message });
	}
 };
 

 export const deleteAccount = async (req, res) => {
	try {
	  // Assuming `req.user` contains the authenticated user details from `protectRoute` middleware
	  const userId = req.user._id;
   
	  // Delete the user from the database
	  const deletedUser = await User.findByIdAndDelete(userId);
   
	  if (!deletedUser) {
	    return res.status(404).json({ error: "User not found" });
	  }
   
	  // Optionally, clear the user's authentication cookie
	  res.clearCookie("jwt", {
	    httpOnly: true,
	    secure: process.env.NODE_ENV === "production",
	    sameSite: "strict",
	  });
   
	  return res.status(200).json({ message: "Account deleted successfully" });
	} catch (error) {
	  console.error("Error deleting account:", error.message);
	  return res.status(500).json({ error: "Internal Server Error" });
	}
};