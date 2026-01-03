import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please enter your name"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Please enter your email"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Please enter a password"],
            minlength: [6, "Password must be at least 6 characters"],
            select: false,
        },
        role: {
            type: String,
            enum: ["admin", "user"],
            default: "user",
        },
        // Account Status: active vs blocked
        status: {
            type: String,
            enum: ["active", "blocked"],
            default: "active",
        },
        // Security Tracking
        lastLoginAt: {
            type: Date,
            default: null,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        verificationToken: {
            type: String,
            default: null,
        },
        verificationTokenExpires: {
            type: Date,
            default: null,
        },
        lastVerificationSentAt: {
            type: Date,
            default: null,
        },
        resetPasswordToken: {
            type: String,
            default: null,
        },
        resetPasswordExpires: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

// Performance Indexing
userSchema.index({ email: 1 });

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash verification token
userSchema.methods.generateVerificationToken = function () {
    // Generate token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Hash and set to verificationToken field
    this.verificationToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");

    // Set expiration
    this.verificationTokenExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

    return verificationToken;
};

// Generate and hash password reset token
userSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    // Set expiration
    this.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

    return resetToken;
};

export default mongoose.model("User", userSchema);