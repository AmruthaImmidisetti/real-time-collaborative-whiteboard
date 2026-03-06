import pool from "../db/db.js";
import { v4 as uuidv4 } from "uuid";

/* Create Board */
export const createBoard = async (req, res) => {
  try {
    const boardId = uuidv4();

    await pool.query(
      "INSERT INTO boards (id, objects) VALUES ($1, $2)",
      [boardId, JSON.stringify([])]
    );

    res.status(201).json({ boardId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create board" });
  }
};

/* Save Board */
export const saveBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { objects } = req.body;

    await pool.query(
      "UPDATE boards SET objects=$1, updated_at=NOW() WHERE id=$2",
      [JSON.stringify(objects), boardId]
    );

    res.status(200).json({
      success: true,
      boardId,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to save board" });
  }
};

/* Load Board */
export const loadBoard = async (req, res) => {
  try {
    const { boardId } = req.params;

    const result = await pool.query(
      "SELECT * FROM boards WHERE id=$1",
      [boardId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Board not found" });
    }

    const board = result.rows[0];

    res.status(200).json({
      boardId: board.id,
      objects: board.objects,
      updatedAt: board.updated_at,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to load board" });
  }
};