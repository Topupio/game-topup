import { Router } from "express";
import { getGames, getHomePageGames, getDistinctCategories, getGamesByPaymentCategory, getPopularGames, getGameDetails, createGame, updateGame, deleteGame, bulkUpdateGameStatus } from "../controllers/game.controller.js";
import { verifyPlayer, verificationHealth } from "../controllers/g2bulk.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

// Public: list all games
router.get("/", getGames);
router.get("/home", getHomePageGames);
router.get("/categories", getDistinctCategories);
router.get("/payment-categories", getGamesByPaymentCategory);
router.get("/popular", getPopularGames);

// Player verification via external API
router.post("/verify-player", verifyPlayer);
router.get("/verify-player/health", protect, authorize("admin"), verificationHealth);

router.get('/:slug' , getGameDetails)

// Admin only: create, update, delete
router.patch("/bulk-status", protect, authorize("admin"), bulkUpdateGameStatus);
router.post("/", protect, authorize("admin"), upload.any(), createGame);
router.put("/:slug", protect, authorize("admin"), upload.any(), updateGame);
router.delete("/:id", protect, authorize("admin"), deleteGame);

export default router;
