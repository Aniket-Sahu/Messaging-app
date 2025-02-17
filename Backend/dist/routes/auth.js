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
import passport from "passport";
import { pool } from "../config/db.js";
import bcrypt from "bcrypt";
import { Strategy } from "passport-local";
const router = express.Router();
const saltRounds = 10;
passport.use(new Strategy((username, password, cb) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("passport triggered");
    try {
        console.log("passport started");
        const result = yield pool.query("SELECT * FROM users WHERE username = $1", [username]);
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
        else {
            console.log("user not found");
        }
    }
    catch (err) {
        console.log(err);
        return cb(err);
    }
})));
passport.serializeUser((user, done) => {
    done(null, user.user_id);
});
passport.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield pool.query("SELECT * FROM users WHERE user_id = $1", [id]);
        const user = result.rows[0];
        done(null, user);
    }
    catch (err) {
        done(err, null);
    }
}));
router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return res
                .status(500)
                .json({ message: "Error during logout", error: err });
        }
        res.status(200).json("/login");
    });
});
router.post("/login", (req, res, next) => {
    console.log("login api clicked");
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            console.log("server error");
            return res
                .status(500)
                .json({ success: false, message: "Server error" });
        }
        if (!user) {
            console.log("No user found");
            return res
                .status(401)
                .json({ success: false, message: "Invalid credentials" });
        }
        req.logIn(user, (err) => {
            if (err) {
                console.log("server error 2");
                return res
                    .status(500)
                    .json({ success: false, message: "Login failed" });
            }
            console.log("Success");
            return res
                .status(200)
                .json({ success: true, message: "Logged in successfully" });
        });
    })(req, res, next);
});
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.body.username;
    const password = req.body.password;
    try {
        const checkResult = yield pool.query("SELECT * FROM users WHERE username = $1", [username]);
        if (checkResult.rows.length > 0) {
            res
                .status(400)
                .json({ success: false, message: "Username already exists" });
            return;
        }
        else {
            bcrypt.hash(password, saltRounds, (err, hash) => __awaiter(void 0, void 0, void 0, function* () {
                if (err) {
                    console.error("Error hashing password:", err);
                    return res
                        .status(500)
                        .json({ success: false, message: "Internal server error" });
                }
                else {
                    const UID = Math.floor(Math.random() * 100000000);
                    const result = yield pool.query("INSERT INTO users (username, password, UID) VALUES ($1, $2, $3) RETURNING user_id,username", [username, hash, UID]);
                    const newUser = result.rows[0];
                    req.login(newUser, (err) => {
                        if (err) {
                            console.error("Error during login:", err);
                            return res
                                .status(500)
                                .json({ success: false, message: "Login error" });
                        }
                        res.json({ success: true, redirect: "/app" });
                    });
                }
            }));
        }
    }
    catch (err) {
        console.log(err);
    }
}));
router.get("/auth-status", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.isAuthenticated()) {
        res.json({ authenticated: true, user: req.user });
    }
    else {
        res.json({ authenticated: false, user: null });
    }
}));
export default router;
//# sourceMappingURL=auth.js.map