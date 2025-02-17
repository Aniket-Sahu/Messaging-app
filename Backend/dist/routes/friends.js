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
router.get("/api/friends", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user) {
        const userId = req.user.user_id;
        try {
            const friends = yield pool.query(`SELECT u.user_id, u.username 
            FROM friend f 
            JOIN users u ON f.friend_user_id = u.user_id 
            WHERE f.user_id = $1 
            UNION 
            SELECT u.user_id, u.username 
            FROM friend f 
            JOIN users u ON f.user_id = u.user_id 
            WHERE f.friend_user_id = $1`, [userId]);
            res.json(friends.rows);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ message: "Error fetching friends" });
        }
    }
}));
router.get("/api/getDetails/:friendId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user) {
        const friendId = parseInt(req.params.friendId, 10);
        if (isNaN(friendId)) {
            res.status(400).json({ message: "Invalid friend ID" });
            return;
        }
        try {
            const result = yield pool.query("SELECT username, bio FROM users WHERE user_id = $1", [
                friendId,
            ]);
            if (result.rows.length === 0) {
                res.status(404).json({ message: "Friend not found" });
                return;
            }
            res.json({ details: result.rows[0] });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ message: "Error fetching details" });
        }
    }
}));
router.post("/api/sendFriendReq", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user) {
        const { friendUID } = req.body;
        const userId = req.user.user_id;
        if (!friendUID) {
            res.status(400).json({ error: "Friend's UID is required" });
            return;
        }
        try {
            const friendResult = yield pool.query("SELECT user_id FROM users WHERE UID = $1", [friendUID]);
            if (friendResult.rows.length === 0) {
                res.status(404).json({ error: "Friend not found" });
                return;
            }
            const friendId = friendResult.rows[0].user_id;
            if (userId === friendId) {
                res
                    .status(400)
                    .json({ error: "You cannot send a friend request to yourself" });
                return;
            }
            const existingFriend = yield pool.query("SELECT * FROM friend WHERE user_id = $1 AND friend_user_id = $2", [userId, friendId]);
            if (existingFriend.rows.length > 0) {
                res.status(400).json({ error: "Friendship already exists" });
                return;
            }
            const existingRequest = yield pool.query("SELECT * FROM friend_req WHERE user_id = $1 AND friend_id = $2 AND status = 'pending'", [userId, friendId]);
            if (existingRequest.rows.length > 0) {
                res.status(400).json({ error: "Friend request already sent" });
                return;
            }
            const result = yield pool.query("INSERT INTO friend_req (user_id, friend_id) VALUES ($1, $2) RETURNING *", [userId, friendId]);
            res.json(result.rows[0]);
        }
        catch (error) {
            console.error("Error adding friend", error);
            res.status(500).json({ error: "Failed to add friend." });
        }
    }
}));
router.get("/friendReqs", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user) {
        const userId = req.user.user_id;
        try {
            const friendRequests = yield pool.query(`SELECT friend_req.*, users.username 
           FROM friend_req 
           JOIN users ON friend_req.user_id = users.user_id 
           WHERE friend_req.friend_id = $1 AND friend_req.status = 'pending'`, [userId]);
            res.json(friendRequests.rows);
        }
        catch (error) {
            console.error("Error fetching friend requests", error);
            res.status(500).json({ error: "Failed to fetch friend requests." });
        }
    }
    else {
        res.status(401).json({ error: "Unauthorized" });
    }
}));
router.post('/api/acceptRequest/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        res.status(400).json({ message: 'Invalid request ID' });
        return;
    }
    try {
        const result = yield pool.query(`
      UPDATE friend_req
      SET status = 'accepted'
      WHERE req_id = $1
      RETURNING *;
    `, [id]);
        if (result.rowCount === 0) {
            res.status(404).json({ message: 'Friend request not found' });
            return;
        }
        const { user_id, friend_id } = result.rows[0];
        const insertFriendshipQuery = `
      INSERT INTO friend (user_id, friend_user_id)
      VALUES ($1, $2), ($2, $1)
      ON CONFLICT DO NOTHING;
    `;
        yield pool.query(insertFriendshipQuery, [user_id, friend_id]);
        res.status(200).json({ message: 'Friend request accepted successfully' });
    }
    catch (error) {
        console.error('Error accepting friend request:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
router.post('/api/rejectRequest/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        res.status(400).json({ message: 'Invalid request ID' });
        return;
    }
    try {
        const result = yield pool.query(`
      UPDATE friend_req
      SET status = 'rejected'
      WHERE req_id = $1
      RETURNING *;
    `, [id]);
        if (result.rowCount === 0) {
            res.status(404).json({ message: 'Friend request not found' });
            return;
        }
        res.status(200).json({ message: 'Friend request rejected successfully' });
    }
    catch (error) {
        console.error('Error accepting friend request:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
router.delete("/api/removeFriend/:friendId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.isAuthenticated()) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const friendId = parseInt(req.params.friendId, 10);
    try {
        yield pool.query("DELETE FROM friend WHERE (user_id = $1 AND friend_user_id = $2) OR (friend_user_id = $1 AND user_id = $2)", [
            req.user.user_id,
            friendId
        ]);
        yield pool.query("DELETE FROM messages WHERE (user_id = $1 AND friend_id = $2) OR (friend_id = $1 AND user_id = $2)", [
            req.user.user_id,
            friendId
        ]);
        res.status(204).send();
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error removing friend" });
    }
}));
export default router;
//# sourceMappingURL=friends.js.map