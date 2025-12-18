import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendPasswordResetEmail = async (email, token) => {
    const url = `${process.env.CLIENT_URL}/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const message = `
        You requested a password reset. 
        
        Click the link below to reset your password:
        ${url}

        If you did not request this, please ignore this email.
        This link expires in 15 minutes.
    `;

    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: "Password Reset Request",
        text: message,
    });
};
