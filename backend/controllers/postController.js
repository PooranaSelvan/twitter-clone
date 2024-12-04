import Notification from "../models/notificationModel.js";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";

export const createPost = async (req, res) => {
	try {

		// getting text, img, userId from frontend
		const { text } = req.body;
		let { img } = req.body;
		const userId = req.user._id.toString();

		// finding user by its id
		const user = await User.findById(userId);

		// if id not found
		if (!user) return res.status(404).json({ message: "User not found" });

		// if text & img not found
		if (!text && !img) {
			return res.status(400).json({ error: "Post must have text or image" });
		}

		// if img found - upload to cloudinary :)
		if (img) {
			const uploadedResponse = await cloudinary.uploader.upload(img);
			img = uploadedResponse.secure_url;
		}

		// create new obj & save it to db
		const newPost = new Post({
			user: userId,
			text,
			img,
		});

		await newPost.save();
		res.status(201).json(newPost);
	} catch (error) {
		res.status(500).json({ error: "Internal server error" });
		console.log("Error in createPost controller: ", error);
	}
};

export const deletePost = async (req, res) => {
	try {

		// finding post by post id.
		const post = await Post.findById(req.params.id);

		// if post not found
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		if (post.user.toString() !== req.user._id.toString()) {
			return res.status(401).json({ error: "You are not authorized to delete this post" });
		}

		// deleting image from cloudinary
		if (post.img) {
			const imgId = post.img.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(imgId);
		}

		// finding post by id & deleting it from db.
		await Post.findByIdAndDelete(req.params.id);

		res.status(200).json({ message: "Post deleted successfully" });
	} catch (error) {
		console.log("Error in deletePost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const commentOnPost = async (req, res) => {
	try {

		// getting text, userId, postId
		const { text } = req.body;
		const postId = req.params.id;
		const userId = req.user._id;

		// if text not found
		if (!text) {
			return res.status(400).json({ error: "Text field is required" });
		}

		// finding post by its id
		const post = await Post.findById(postId);

		// if post not found
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		// creating comment obj
		const comment = { user: userId, text };

		// saving into db.
		post.comments.push(comment);
		await post.save();

		res.status(200).json(post);
	} catch (error) {
		console.log("Error in commentOnPost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const likeUnlikePost = async (req, res) => {
	try {

		// getting userId & postId.
		const userId = req.user._id;
		const { id: postId } = req.params;

		// finding post by its id.
		const post = await Post.findById(postId);

		// if post not found:
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		// post includes the got userId or not.
		const userLikedPost = post.likes.includes(userId);

		if (userLikedPost) {
			// if user already liked the post, remove the userId from likes array.
			// Unlike post
			await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
			await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });


			const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
			res.status(200).json(updatedLikes);
		} else {
			// if user is not liked the post, add the userId to likes arr.
			// Like post
			post.likes.push(userId);
			await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
			await post.save();

			// if liked send notification & save to db.
			const notification = new Notification({
				from: userId,
				to: post.user,
				type: "like",
			});
			await notification.save();

			const updatedLikes = post.likes;
			res.status(200).json(updatedLikes);
		}
	} catch (error) {
		console.log("Error in likeUnlikePost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getAllPosts = async (req, res) => {
	try {

		// finding all posts.
		const posts = await Post.find()
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		if (posts.length === 0) {
			return res.status(200).json([]);
		}

		res.status(200).json(posts);
	} catch (error) {
		console.log("Error in getAllPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getLikedPosts = async (req, res) => {

	// getting user id.
	const userId = req.params.id;

	try {

		// searching user by its id.
		const user = await User.findById(userId);

		// if user not found.
		if (!user) return res.status(404).json({ error: "User not found" });

		const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(likedPosts);
	} catch (error) {
		console.log("Error in getLikedPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getFollowingPosts = async (req, res) => {
	try {

		// getting user id.
		const userId = req.user._id;

		// finding user by its id.
		const user = await User.findById(userId);

		// if user not found.
		if (!user) return res.status(404).json({ error: "User not found" });

		// getting following arr.
		const following = user.following;

		// finding posts by follows.
		const feedPosts = await Post.find({ user: { $in: following } })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(feedPosts);
	} catch (error) {
		console.log("Error in getFollowingPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getUserPosts = async (req, res) => {
	try {
		// getting user name.
		const { username } = req.params;

		// finding user with name
		const user = await User.findOne({ username });

		// if user not found
		if (!user) return res.status(404).json({ error: "User not found" });


		// finding posts by userId
		const posts = await Post.find({ user: user._id })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(posts);
	} catch (error) {
		console.log("Error in getUserPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};
