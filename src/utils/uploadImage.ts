import cloudinary from "../config/cloudinary.config";

const uploadImage = (file: Express.Multer.File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("No file uploaded"));

    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        if (result?.secure_url) resolve(result.secure_url);
        else reject(new Error("Upload failed"));
      }
    );

    stream.end(file.buffer);
  });
};

export default uploadImage;
