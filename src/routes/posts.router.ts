import express from "express";
import upload from "../config/multerconfig";
import { addPost, deletePost, getAllPosts, readPost, updatePost } from "../controllers/post.controller";

const router = express.Router();

// Create Post
router.post("/:userId/add-post", upload.single("file"), addPost);

router.get("/:userId/all-posts", getAllPosts);
// Read Post
router.get("/:userId/:postId", readPost);

// Update Post
router.put("/:userId/:postId", upload.single("file"), updatePost);

// Delete Post
router.delete("/:userId/:postId", deletePost);

export default router;
