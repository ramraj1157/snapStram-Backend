import NodeCache from "node-cache";
import nodemailer from "nodemailer";
import { Request, Response } from "express";
import User from "../models/user.model";
import { blockTemplate, loginTemplate, registerTemplate } from "../utils/template";

// Initialize NodeCache (OTP Cache)
const otpCache = new NodeCache({ stdTTL: 300 });

// OTP Helper Functions
const generateOtp = (key: string): string => {
    const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
    otpCache.set(key, otp);
    return otp;
};

const getOtp = (key: string): string | null => otpCache.get<string>(key) || null;
const clearOtp = (key: string): void => { otpCache.del(key); };

// Email Sending Utility
interface SendEmailProps {
    email: string;
    name: string;
    otp: string;
    useCase: string;
}

const sendEmail = async ({ email, name, otp, useCase }: SendEmailProps): Promise<void> => {
    try {
        let subjectMessage = "";
        let htmlTemplate = `<h1>Error</h1>`;

        if (useCase === "register") {
            subjectMessage = "OTP for Registering - TradingJournalPro!";
            htmlTemplate = registerTemplate(name, otp);
        } else if (useCase === "login") {
            subjectMessage = "OTP for Login - TradingJournalPro!";
            htmlTemplate = loginTemplate(otp, name);
        } else if (useCase === "resetPassword") {
            subjectMessage = "OTP for Resetting Password - TradingJournalPro!";
            htmlTemplate = `<div><p>Hi ${name},</p><p>Your OTP for resetting your password is:</p><h2>${otp}</h2></div>`;
        } else {
            subjectMessage = "Account Blocked - TradingJournalPro!";
            htmlTemplate = blockTemplate(name);
        }

        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST as string,
            port: 465,
            secure: true,
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER as string,
                pass: process.env.MAIL_PASS as string,
            },
        });

        const mailOptions = { to: email, subject: subjectMessage, html: htmlTemplate };

        return new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error("Error sending email:", error);
                    reject(error);
                } else {
                    console.log("Email sent:", info.messageId);
                    resolve();
                }
            });
        });
    } catch (err) {
        console.error("Error in sendEmail:", err);
        throw err;
    }
};

// **OTP Sending API**
interface SendOtpRequestBody {
    email: string;
    useCase: string;
    isLogin?: boolean;
    name?: string;
}

export const sendOtp = async (req: Request<{}, {}, SendOtpRequestBody>, res: Response): Promise<void> => {
    try {
        const { email, useCase, isLogin, name } = req.body;

        if (!email) {
             res.status(400).json({ success: false, message: "Please provide an email address." });
             return;
        }

        const userExists = await User.findOne({ email });
        let userName = name;

        if (!isLogin) {
            if (userExists) {
                console.log("User exists");
                 res.status(409).json({ success: false, message: "User already exists." });
                 return;
            }
        } else {
            if (!userExists) {
                 res.status(404).json({ success: false, message: "User not found." });
                 return;
            }
            userName = userExists?.name;
        }

        const otp = generateOtp(email);
        console.log("Generated OTP:", otp);

        try {
            await sendEmail({ email, name: userName || email, otp, useCase });
        } catch (error) {
             res.status(500).json({ success: false, message: "Failed to send OTP email." });
             return;
        }

        const otpResponse = { otp };

        
         res.status(200).json({
            success: true,
            otpInfo: otpResponse,
            message: "OTP sent successfully",

            
        });
    } catch (err: any) {
        console.error("Error in sendOtp:", err.message);
         res.status(500).json({ success: false, message: err.message });

    }
};

// **OTP Verification API**
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, otp }: { email: string; otp: string } = req.body;

        if (!email || !otp) {
             res.status(400).json({ success: false, message: "Please provide email and OTP." });
             return;
        }

        const correctOtp = getOtp(email);
        console.log({ email, userOTP: otp, correctOTP: correctOtp });

        if (!correctOtp) {
             res.status(400).json({ success: false, message: "OTP is expired." });
             return;
        }

        if (otp !== correctOtp) {
             res.status(400).json({ success: false, message: "Invalid OTP." });
             return;
        }

        clearOtp(email);
         res.status(200).json({ success: true, message: "OTP Verified Successfully" });
    } catch (err: any) {
         res.status(500).json({ success: false, message: err.message });
    }
};
