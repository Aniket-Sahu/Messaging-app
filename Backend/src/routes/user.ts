import express, { Request, Response, NextFunction } from "express";
import { QueryResult } from "pg";
import { pool } from "../config/db.js";

interface Message {
    message_id?: number;
    user_id: number;
    friend_id: number;
    time: Date;
    message: string;
}

const router = express.Router();

router.patch("/api/editUsername", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const userId = req.user.user_id;
  const { newusername } = req.body as { newusername: string };
  try {
    const result: QueryResult<Message> = await pool.query(
      "UPDATE users SET username = $1 WHERE user_id = $2 RETURNING *",
      [newusername, userId]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ text: "User not found" });
      return;
    }
    res.status(200).json({ text: "Username successfully updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ text: "Error encountered" });
  }
});

router.patch("/api/editBio", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const userId = req.user.user_id;
  const { newBio } = req.body as { newBio: string };
  try {
    const result: QueryResult<Message> = await pool.query(
      "UPDATE users SET bio = $1 WHERE user_id = $2 RETURNING *",
      [newBio, userId]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ text: "User not found" });
      return;
    }
    res.status(200).json({ text: "Bio successfully updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ text: "Error encountered" });
  }
});

export default router;