import express from "express";
import {
  getFavorites,
  addFavorite,
  removeFavorite,
} from "../controllers/favoriteController.js";

const router = express.Router();

router.get("/", getFavorites);
router.post("/add", addFavorite);
router.post("/remove", removeFavorite);

export default router;
