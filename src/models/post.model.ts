import mongoose, { Schema, Document } from "mongoose";

interface IPost extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    image: string;
    hashTags: string;
    likes: mongoose.Types.ObjectId[];
    comments: { userId: mongoose.Types.ObjectId; text: string; createdAt: Date }[];
}

const postSchema = new Schema<IPost>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User", // Assuming you have a "User" model
            required: true
        },
        name: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true
        },
        hashTags: {
            type: String,
            default: "#trending"
        },
        likes: {
            type: [{ type: Schema.Types.ObjectId, ref: "User" }],
            default: []
        },
        comments: {
            type: [
                {
                    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
                    text: { type: String, required: true },
                    createdAt: { type: Date, default: Date.now }
                }
            ],
            default: []
        }
    },
    { timestamps: true }
);

const Post = mongoose.model<IPost>("Post", postSchema);
export default Post;
