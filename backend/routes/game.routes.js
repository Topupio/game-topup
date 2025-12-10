import { Router } from "express";
import { getGames, getHomePageGames, getGameDetails, createGame, updateGame, deleteGame } from "../controllers/game.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

// Public: list all games
router.get("/", getGames);
router.get("/home", getHomePageGames);
router.get('/:slug' , getGameDetails)

// Admin only: create, update, delete
router.post("/", protect, authorize("admin"), upload.single('image'), createGame);
router.put("/:slug", protect, authorize("admin"), upload.single('image'), updateGame);
router.delete("/:id", protect, authorize("admin"), deleteGame);

export default router;
