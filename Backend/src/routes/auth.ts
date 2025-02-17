import express, { Request, Response, NextFunction } from "express";
import passport from "passport";
import { QueryResult } from "pg";
import { pool } from "../config/db.js";
import bcrypt from "bcrypt";
import { Strategy } from "passport-local";

const router = express.Router();
const saltRounds = 10;

passport.use(
  new Strategy(async (username, password, cb) => {
    try {
      const result: QueryResult<Express.User> = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password as string;
        if (storedHashedPassword) {
          bcrypt.compare(password, storedHashedPassword, (err, valid) => {
            if (err) {
              console.error("Error comparing passwords:", err);
              return cb(err);
            } else if (valid) {
              return cb(null, user);
            } else {
              return cb(null, false);
            }
          });
        } else {
          return cb(null, false);
        }
      }
    } catch (err) {
      console.log(err);
      return cb(err);
    }
  })
);

passport.serializeUser((user: Express.User, done) => {
  done(null, user.user_id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const result: QueryResult<Express.User> = await pool.query(
      "SELECT * FROM users WHERE user_id = $1",
      [id]
    );
    const user = result.rows[0];
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

router.get("/logout", (req: Request, res: Response, next: NextFunction) => {
  req.logout((err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error during logout", error: err });
    }
    res.status(200).json("/login");
  });
});

router.post("/login", (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    "local",
    (err: Error | null, user: Express.User, info: any) => {
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
      req.logIn(user, (err: Error | null) => {
        if (err) {
          return res
            .status(500)
            .json({ success: false, message: "Login failed" });
        }
        return res
          .status(200)
          .json({ success: true, message: "Logged in successfully" });
      });
    }
  )(req, res, next);
});

router.post("/register", async (req: Request, res: Response) => {
  const username: string = req.body.username;
  const password: string = req.body.password;

  try {
    const checkResult: QueryResult<Express.User> = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    if (checkResult.rows.length > 0) {
      res
        .status(400)
        .json({ success: false, message: "Username already exists" });
      return;
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
          return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
        } else {
          const UID: number = Math.floor(Math.random() * 100000000);
          const result: QueryResult<Express.User> = await pool.query(
            "INSERT INTO users (username, password, UID) VALUES ($1, $2, $3) RETURNING user_id,username",
            [username, hash, UID]
          );
          const newUser = result.rows[0];
          req.login(newUser, (err: Error) => {
            if (err) {
              console.error("Error during login:", err);
              return res
                .status(500)
                .json({ success: false, message: "Login error" });
            }
            res.json({ success: true, redirect: "/app" });
          });
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
});

router.get("/auth-status", async (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    res.json({ authenticated: true, user: req.user });
  } else {
    res.json({ authenticated: false, user: null });
  }
});

export default router;