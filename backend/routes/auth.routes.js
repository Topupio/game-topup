import { Router } from "express";
import { register, login, logout, me, forgotPassword, resetPassword, verifyEmail, resendVerification } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authLimiter, sensitiveLimiter } from "../middlewares/rateLimit.middleware.js";
import { verifyRecaptcha } from "../middlewares/recaptcha.middleware.js";
import { registerValidation, loginValidation, handleValidation } from "../middlewares/validators/auth.validators.js";

const router = Router();

router.get('/csrf', (req, res) => {
  res.status(200).json({ success: true, csrfToken: req.csrfToken() });
});

router.post("/register", authLimiter, verifyRecaptcha("register"), registerValidation, handleValidation, register);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", authLimiter, verifyRecaptcha("resend_verification"), resendVerification);
router.post("/login", authLimiter, verifyRecaptcha("login"), loginValidation, handleValidation, login);
router.post("/forgot-password", authLimiter, forgotPassword);
router.put("/reset-password/:token", authLimiter, resetPassword);
router.post("/logout", sensitiveLimiter, logout);
router.get("/me", protect, me);
router.post('/refresh', sensitiveLimiter, (req, res, next) => import('../controllers/auth.controller.js').then(m => m.refreshToken(req, res, next)));

export default router;
