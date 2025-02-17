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

router.get("/api/messages", async (req: Request, res: Response) => {
  if (req.user) {
    const userId = req.user.user_id;
    const friendIdString = req.query.friend_id as string;
    try {
      const friendId = parseInt(friendIdString, 10);
      const result: QueryResult<Message> = await pool.query(
        "SELECT * FROM messages WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)",
        [userId, friendId]
      );
      res.json({ messages: result.rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error fetching messages" });
    }
  }
});

export default router;