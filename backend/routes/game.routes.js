import { Router } from "express";
import { getGames, createGame, updateGame, deleteGame } from "../controllers/game.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = Router();

// Public: list all games
router.get("/", getGames);

// Admin only: create, update, delete
router.post("/", protect, authorize("admin"), createGame);
router.put("/:id", protect, authorize("admin"), updateGame);
router.delete("/:id", protect, authorize("admin"), deleteGame);

export default router;
