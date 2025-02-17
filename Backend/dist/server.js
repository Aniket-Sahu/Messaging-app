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
import bodyParser from "body-parser";
import passport from "passport";
import { Server } from "socket.io";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { sessionMiddleware } from "./middlewares/sessionMiddleware.js";
import { pool } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import friendsRoutes from "./routes/friends.js";
import messagesRoutes from "./routes/messages.js";
import userRoutes from "./routes/user.js";
dotenv.config();
const app = express();
const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "PATCH", "DELETE"],
        credentials: true,
    },
    transports: ["websocket", "polling"],
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../../React App/build")));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../../React app/build/index.html"));
});
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "../../React app/build/index.html"));
});
app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "../../React app/build/index.html"));
});
app.get("/app", (req, res) => {
    if (req.isAuthenticated()) {
        res.sendFile(path.join(__dirname, "../../React app/build/index.html"));
    }
    else {
        res.redirect("/login");
    }
});
app.use(authRoutes);
app.use(friendsRoutes);
app.use(messagesRoutes);
app.use(userRoutes);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});
io.use((socket, next) => {
    const req = socket.request;
    sessionMiddleware(req, {}, () => {
        passport.initialize()(req, {}, () => {
            passport.session()(req, {}, () => {
                if (req.isAuthenticated && req.isAuthenticated()) {
                    return next();
                }
                next(new Error("Unauthorized"));
            });
        });
    });
});
const userSockets = new Map();
io.on("connection", (socket) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Socket connected: ${socket.id}`);
    const req = socket.request;
    if (!req.isAuthenticated()) {
        console.log("unauthorised user attempted connection");
        socket.disconnect();
        return;
    }
    const userId = req.user.user_id;
    userSockets.set(userId, socket.id);
    socket.on("message", (_a, callback_1) => __awaiter(void 0, [_a, callback_1], void 0, function* ({ message, friendId }, callback) {
        const userId = req.user.user_id;
        if (!message || !friendId) {
            return callback("Invalid message format");
        }
        try {
            const newMessage = yield pool.query(`INSERT INTO messages (user_id, friend_id, message, time)
        VALUES ($1, $2, $3, NOW()) RETURNING *`, [userId, friendId, message]);
            const savedMessage = newMessage.rows[0];
            const recipientSocketId = userSockets.get(friendId);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit("message", savedMessage);
            }
            io.to(socket.id).emit("message", savedMessage);
            callback();
        }
        catch (error) {
            console.error("Error saving message:", error);
            callback("Error sending message");
        }
    }));
    socket.on("editMessage", (_a, callback_1) => __awaiter(void 0, [_a, callback_1], void 0, function* ({ messageId, editedMessage }, callback) {
        try {
            const result = yield pool.query("UPDATE messages set message = $1 WHERE message_id = $2 RETURNING *", [editedMessage, messageId]);
            if (result.rowCount === 0) {
                return callback("Message not found or not authorized");
            }
            const updatedMessage = result.rows[0];
            io.emit("messageEdited", updatedMessage);
            callback(null, updatedMessage);
        }
        catch (error) {
            console.error("Error editing message:", error);
            callback("Error editing message");
        }
    }));
    socket.on("deleteMessage", (_a, callback_1) => __awaiter(void 0, [_a, callback_1], void 0, function* ({ messageId }, callback) {
        try {
            yield pool.query("DELETE FROM messages WHERE message_id = $1", [messageId]);
            io.emit("messageDeleted", { messageId });
            callback(null);
        }
        catch (error) {
            console.error("Error deleting message:", error);
            callback("Error deleting message");
        }
    }));
    socket.on("disconnect", () => {
        console.log(`User ${userId} disconnected.`);
        userSockets.delete(userId);
    });
}));
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "..", "React app", "build", "index.html"));
});
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
//# sourceMappingURL=server.js.map