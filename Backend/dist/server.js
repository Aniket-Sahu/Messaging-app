var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/*Functionalities to add -
// Log out should redirect instead of just show a reponse
Deleting a message - This is also tricky. Am I to add a seperate 'message-id' to each message so as to delete it? or am I going to
take a less effcient way. Actually if I feel like changing the DB then I won't do those in the protoype.*/
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();
const app = express();
const port = 3000;
const saltRounds = 10;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
    },
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: Number(process.env.PG_PORT),
});
db.connect();
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
app.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/login");
    });
});
app.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return res
                .status(500)
                .json({ success: false, message: "Server error" });
        }
        if (!user) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid credentials" });
        }
        req.logIn(user, (err) => {
            if (err) {
                return res
                    .status(500)
                    .json({ success: false, message: "Login failed" });
            }
            return res
                .status(200)
                .json({ success: true, message: "Logged in successfully" });
        });
    })(req, res, next);
});
app.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.body.username;
    const password = req.body.password;
    try {
        const checkResult = yield db.query("SELECT * FROM users WHERE username = $1", [username]);
        if (checkResult.rows.length > 0) {
            res.status(400).json({ success: false, message: 'Username already exists' });
            return;
        }
        else {
            bcrypt.hash(password, saltRounds, (err, hash) => __awaiter(void 0, void 0, void 0, function* () {
                if (err) {
                    console.error("Error hashing password:", err);
                    return res.status(500).json({ success: false, message: 'Internal server error' });
                }
                else {
                    const result = yield db.query("INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *", [username, hash]);
                    const newUser = result.rows[0];
                    req.login(newUser, (err) => {
                        if (err) {
                            console.error("Error during login:", err);
                            return res.status(500).json({ success: false, message: 'Login error' });
                        }
                        res.json({ success: true, redirect: '/app' });
                    });
                }
            }));
        }
    }
    catch (err) {
        console.log(err);
    }
}));
app.get("/auth-status", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.isAuthenticated()) {
        console.log(req.user.user_id);
        res.json({ authenticated: true, user: req.user });
    }
    else {
        res.json({ authenticated: false, user: null });
    }
}));
app.get("/api/friends", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user) {
        const userId = req.user.user_id;
        console.log(userId);
        try {
            const friends = yield db.query(`SELECT u.user_id, u.username 
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
app.get("/api/messages", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user) {
        const userId = req.user.user_id;
        const friendIdString = req.query.friend_id;
        try {
            const friendId = parseInt(friendIdString, 10);
            const result = yield db.query("SELECT * FROM data WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)", [userId, friendId]);
            res.json({ messages: result.rows });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ message: "Error fetching messages" });
        }
    }
}));
app.post("/api/addFriend", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user) {
        const { friendName } = req.body;
        const userId = req.user.user_id;
        if (!friendName) {
            res.status(400).json({ error: "Friend's username is required" });
            return;
        }
        try {
            const friendResult = yield db.query("SELECT user_id FROM users WHERE username = $1", [friendName]);
            if (friendResult.rows.length === 0) {
                res.status(404).json({ error: "Friend not found" });
                return;
            }
            const friendId = friendResult.rows[0].user_id;
            const result = yield db.query("INSERT INTO friend (user_id, friend_user_id) VALUES ($1, $2) RETURNING *", [userId, friendId]);
            res.json(result.rows[0]);
        }
        catch (error) {
            console.error("Error adding friend", error);
            res.status(500).json({ error: "Failed to add friend." });
        }
    }
}));
app.post("/api/sendMessage", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user) {
        const { message, friend_id } = req.body;
        const userId = req.user.user_id;
        if (!message || !friend_id) {
            res.status(400).json({ error: "Message and friendId are required." });
            return;
        }
        try {
            const result = yield db.query("INSERT INTO data (user_id, friend_id, message, time) VALUES ($1, $2, $3, NOW()) RETURNING *", [userId, friend_id, message]);
            res.json(result.rows[0]);
        }
        catch (error) {
            console.error("Error sending message:", error);
            res.status(500).json({ error: "Failed to send a message." });
        }
    }
}));
/*
app.delete("/api/messages/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const noteId = parseInt(req.params.id, 10);
  
  try {
    await db.query("DELETE FROM data WHERE id = $1 AND user_id = $2", [messageId, req.user.user_id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting message" });
  }
});
*/
passport.use(new Strategy((username, password, cb) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db.query("SELECT * FROM users WHERE username = $1", [username]);
        console.log("Query result:", result.rows);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            const storedHashedPassword = user.password;
            if (storedHashedPassword) {
                bcrypt.compare(password, storedHashedPassword, (err, valid) => {
                    if (err) {
                        console.error("Error comparing passwords:", err);
                        return cb(err);
                    }
                    else if (valid) {
                        return cb(null, user);
                    }
                    else {
                        return cb(null, false);
                    }
                });
            }
            else {
                return cb(null, false);
            }
        }
    }
    catch (err) {
        console.log(err);
        return cb(err);
    }
})));
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "..", "React app", "build", "index.html"));
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});
passport.serializeUser((user, done) => {
    done(null, user.user_id);
});
passport.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db.query("SELECT * FROM users WHERE user_id = $1", [
            id,
        ]);
        const user = result.rows[0];
        done(null, user);
    }
    catch (err) {
        done(err, null);
    }
}));
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
//# sourceMappingURL=server.js.map