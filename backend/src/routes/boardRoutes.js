import express from "express";
import {
  createBoard,
  saveBoard,
  loadBoard,
} from "../controllers/boardController.js";

const router = express.Router();

router.post("/boards", createBoard);
router.post("/boards/:boardId", saveBoard);
router.get("/boards/:boardId", loadBoard);

export default router;