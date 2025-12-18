// utils/sendVerificationEmail.js

import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendVerificationEmail = async (email, token) => {
    const url = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const message = `
        Please verify your email to activate your account.

        Verification link:
        ${url}

        This link expires in 15 minutes.
    `;

    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: "Verify Your Account",
        text: message,
    });
};
