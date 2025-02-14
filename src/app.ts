import express, {Request, Response} from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import userRoute from "./routes/user.router" 
import otpRoute from "./routes/otp.router"
import postRoute from "./routes/posts.router"

const app = express();

app.use(cors());
app.use(express.json());


mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING as string)
  .then(() => console.log("Connected to database!"));

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

app.listen(7000, () => {
    console.log("server started on localhost:7000");
});

app.use("/api/users", userRoute);
app.use("/api/otp", otpRoute);
app.use("/api/posts", postRoute)

app.get("/health", async (req: Request, res: Response) => {
    res.send({ message: "health OK!" });
  });