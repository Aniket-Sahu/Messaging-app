var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import { pool } from "../config/db.js";
const router = express.Router();
router.get("/api/messages", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user) {
        const userId = req.user.user_id;
        const friendIdString = req.query.friend_id;
        try {
            const friendId = parseInt(friendIdString, 10);
            const result = yield pool.query("SELECT * FROM messages WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)", [userId, friendId]);
            res.json({ messages: result.rows });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ message: "Error fetching messages" });
        }
    }
}));
export default router;
//# sourceMappingURL=messages.js.map