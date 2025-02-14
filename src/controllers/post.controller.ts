import { Request, Response } from "express";
import uploadImage from "../utils/uploadImage";
import Post from "../models/post.model";
import User from "../models/user.model";
import mongoose from "mongoose";


export const addPost = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, hashTags } = req.body;
        const {userId} = req.params; 

        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }

        console.log(hashTags)

        if (!req.file) {
            
            return;
        }

        // Upload image
        const imageUrl = await uploadImage(req.file);

        // Process hashtags
        const formattedHashTags =hashTags

        // Create new post
        const newPost = new Post({ userId, name, image: imageUrl, hashTags: formattedHashTags });
        await newPost.save();

        // Add post to user's posts array
        await User.findByIdAndUpdate(userId, { $push: { posts: newPost._id } });

        res.status(201).json({ success: true, message: "Post created successfully", post: newPost });

    } catch (err) {
        console.error("Error in addPost:", err);
        res.status(500).json({ success: false, message: "Error adding post" });
    }
};


export const readPost = async (req: Request, res: Response): Promise<void> => {
    try {
        const { postId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            res.status(400).json({ success: false, message: "Invalid post ID" });
            return;
        }

        const post = await Post.findById(postId).populate("userId", "userName userProfile");

        if (!post) {
            res.status(404).json({ success: false, message: "Post not found" });
            return;
        }

        res.status(200).json({ success: true, post });

    } catch (err) {
        console.error("Error in readPost:", err);
        res.status(500).json({ success: false, message: "Error fetching post" });
    }
};


export const updatePost = async (req: Request, res: Response): Promise<void> => {
    try {
        const { postId } = req.params;
        const { name, hashTags } = req.body;
        const {userId} = req.params;

        

        const post = await Post.findById(postId);
        if (!post) {
            res.status(404).json({ success: false, message: "Post not found" });
            return;
        }

        // Ensure only the owner can update the post
        if (post.userId.toString() !== userId) {
            res.status(403).json({ success: false, message: "Unauthorized to update this post" });
            return;
        }

        // Update image if provided
        let imageUrl = post.image;
        if (req.file) {
            imageUrl = await uploadImage(req.file);
        }

        // Process hashtags
        const formattedHashTags = hashTags

        // Update post
        post.name = name || post.name;
        post.image = imageUrl;
        post.hashTags = formattedHashTags;

        await post.save();

        res.status(200).json({ success: true, message: "Post updated successfully", post });

    } catch (err) {
        console.error("Error in updatePost:", err);
        res.status(500).json({ success: false, message: "Error updating post" });
    }
};


export const deletePost = async (req: Request, res: Response): Promise<void> => {
    try {
        const { postId } = req.params;
        const {userId} = req.params;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            res.status(400).json({ success: false, message: "Invalid post ID" });
            return;
        }

        const post = await Post.findById(postId);
        if (!post) {
            res.status(404).json({ success: false, message: "Post not found" });
            return;
        }

        // Ensure only the owner can delete the post
        if (post.userId.toString() !== userId) {
            res.status(403).json({ success: false, message: "Unauthorized to delete this post" });
            return;
        }

        await Post.findByIdAndDelete(postId);

        // Remove post from user's post list
        await User.findByIdAndUpdate(userId, { $pull: { posts: postId } });

        res.status(200).json({ success: true, message: "Post deleted successfully" });

    } catch (err) {
        console.error("Error in deletePost:", err);
        res.status(500).json({ success: false, message: "Error deleting post" });
    }
};


export const getFeed = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }

        // Get user with following list
        const user = await User.findById(userId).select("following");

        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        // Fetch posts from followed users
        const posts = await Post.find({ userId: { $in: user.following } })
            .sort({ createdAt: -1 }) // Show newest first
            .populate("userId", "userName userProfile");

        res.status(200).json({ success: true, feed: posts });

    } catch (err) {
        console.error("Error in getFeed:", err);
        res.status(500).json({ success: false, message: "Error fetching feed" });
    }
};


export const getAllPosts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            res.status(400).json({ success: false, message: "Invalid user ID" });
            return;
        }


        const posts = await Post.find({ userId }).sort({ createdAt: -1 });

        if (!posts || posts.length === 0) {
            res.status(404).json({ success: false, message: "No posts found for this user" });
            return;
        }

        res.status(200).json({ success: true, posts });

    } catch (err) {
        console.error("Error in getAllPosts:", err);
        res.status(500).json({ success: false, message: "Error fetching posts" });
    }
};
