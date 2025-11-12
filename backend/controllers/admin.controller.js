import User from "../models/user.model.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { sendAuthPair } from "../utils/token.js";

// adminLogin function handles admin login
export const adminLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // find user by email
    const user = await User.findOne({ email }).select("+password");
    if (!user || user.role !== "admin") { 
        res.status(401);
        throw new Error("Invalid admin credentials"); 
    }

    // compare password
    const match = await user.comparePassword(password); 
    if (!match) { 
        res.status(401);
        throw new Error("Invalid admin credentials"); 
    }

    return sendAuthPair(user, 200, res, req.ip);
});

// adminMe function handles admin me endpoint
export const adminMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json({ success: true, user });
});
