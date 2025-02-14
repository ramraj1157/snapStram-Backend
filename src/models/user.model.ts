import mongoose, { Schema, Document } from "mongoose";
import validator from "validator";

interface IUser extends Document {
    userProfile: string;
    userName: string;
    name: string;
    email: string;
    password: string;
    following: mongoose.Types.ObjectId[];
    followers: mongoose.Types.ObjectId[];
    posts: mongoose.Types.ObjectId[];
}

const userSchema = new Schema<IUser>(
    {
        userProfile: {
            type: String,
            default: "https://assets.leetcode.com/users/avatars/avatar_1666800305.png"
        },
        userName: {
            type: String,
           
            trim: true,
            unique: true
        },
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true, // Ensure email is always lowercase
            validate: {
                validator: (value: string) => validator.isEmail(value),
                message: "Invalid email format"
            }
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
          
        },
        following: {
            type: [{ type: Schema.Types.ObjectId, ref: "User" }],
            default: []
        },
        followers: {
            type: [{ type: Schema.Types.ObjectId, ref: "User" }], // Added followers field
            default: []
        },
        posts: {
            type: [{ type: Schema.Types.ObjectId, ref: "Post" }],
            default: []
        }
    },
    { timestamps: true } // Automatically adds createdAt and updatedAt
);

const User = mongoose.model<IUser>("User", userSchema);
export default User;
