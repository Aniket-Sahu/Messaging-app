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
router.patch("/api/editUsername", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.isAuthenticated()) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const userId = req.user.user_id;
    const { newusername } = req.body;
    try {
        const result = yield pool.query("UPDATE users SET username = $1 WHERE user_id = $2 RETURNING *", [newusername, userId]);
        if (result.rowCount === 0) {
            res.status(404).json({ text: "User not found" });
            return;
        }
        res.status(200).json({ text: "Username successfully updated" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ text: "Error encountered" });
    }
}));
router.patch("/api/editBio", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.isAuthenticated()) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const userId = req.user.user_id;
    const { newBio } = req.body;
    try {
        const result = yield pool.query("UPDATE users SET bio = $1 WHERE user_id = $2 RETURNING *", [newBio, userId]);
        if (result.rowCount === 0) {
            res.status(404).json({ text: "User not found" });
            return;
        }
        res.status(200).json({ text: "Bio successfully updated" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ text: "Error encountered" });
    }
}));
export default router;
//# sourceMappingURL=user.js.map