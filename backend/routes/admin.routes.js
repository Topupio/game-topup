import { Router } from "express";
import { adminLogin, adminMe } from "../controllers/admin.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { authLimiter, sensitiveLimiter } from "../middlewares/rateLimit.middleware.js";
import { loginValidation, handleValidation } from "../middlewares/validators/auth.validators.js";

const router = Router();

router.get('/csrf', (req, res) => {
    res.status(200).json({ success: true, csrfToken: req.csrfToken() });
});

router.post('/login', authLimiter, loginValidation, handleValidation, adminLogin);
router.get('/me', protect, authorize('admin'), adminMe);

export default router;