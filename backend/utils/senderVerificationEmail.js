// utils/sendVerificationEmail.js

import { Resend } from 'resend';
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

export const sendVerificationEmail = async (email, token) => {
    const url = `${process.env.CLIENT_URL}/verify-email/${token}`;

    const htmlContent = `
        <h2>Welcome to Game Topup!</h2>
        <p>Please verify your email to activate your account.</p>
        <p>
            <a href="${url}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email
            </a>
        </p>
        <p>Or copy this link: ${url}</p>
        <p style="color: #666; font-size: 12px;">
            This link expires in 15 minutes.<br>
            If you didn't sign up for this account, please ignore this email.
        </p>
    `;

    if (isProd) {
        // Production: Use Resend
        const resend = new Resend(process.env.RESEND_API_KEY);

        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Game Topup <onboarding@resend.dev>',
            to: email,
            subject: "Verify Your Account - Game Topup",
            html: htmlContent,
        });

        if (error) {
            console.error('❌ Resend error:', error);
            throw new Error(`Failed to send email: ${error.message}`);
        }

        console.log('✅ Email sent! ID:', data.id);
        return data;
    } else {
        // Development: Use Ethereal for testing
        const testAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });

        const info = await transporter.sendMail({
            from: '"Game Topup" <noreply@gametopup.com>',
            to: email,
            subject: "Verify Your Account - Game Topup",
            html: htmlContent,
        });

        console.log("📧 Email sent! Preview URL:", nodemailer.getTestMessageUrl(info));
        return info;
    }
};
