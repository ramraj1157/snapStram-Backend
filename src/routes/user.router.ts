import express from "express";
import upload from "../config/multerconfig";
import { register, login, resetPassword, checkUserName, updateProfile } from "../controllers/user.controller";
import { validateLogin, validateRegistration } from "../utils/validation";

const router = express.Router();

router.post("/register",validateRegistration,  register);
router.post("/login",validateLogin, login);
router.post("/reset-password", resetPassword);
router.post("/check-username", checkUserName);
router.put("/update-profile", upload.single("file"), updateProfile);

export default router;
