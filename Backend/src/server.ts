import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import pg, { QueryResult } from "pg";
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

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());

const db = new pg.Client({
  user: process.env.PG_USER as string,
  host: process.env.PG_HOST as string,
  database: process.env.PG_DATABASE as string,
  password: process.env.PG_PASSWORD as string,
  port: Number(process.env.PG_PORT),
});
db.connect();

declare global {
  namespace Express {
    interface User {
      user_id: number;
      username: string;
      password?: string;
      UID?: number;
    }
  }
}

interface Message {
  message_id?: number;
  user_id: number;
  friend_id: number;
  time: Date;
  message: string;
}

interface friends {
  user_id: number;
  friend_user_id: number;
}

app.use(express.static(path.join(__dirname, "../../React App/build")));

app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../../React app/build/index.html"));
});

app.get("/login", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../../React app/build/index.html"));
});

app.get("/register", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../../React app/build/index.html"));
});

app.get("/app", (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    res.sendFile(path.join(__dirname, "../../React app/build/index.html"));
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", (req: Request, res: Response, next: NextFunction) => {
  req.logout((err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error during logout", error: err });
    }
    res.status(200).json("/login");
  });
});

app.post("/login", (req: Request, res: Response, next: NextFunction) => {
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

app.post("/register", async (req: Request, res: Response) => {
  const username: string = req.body.username;
  const password: string = req.body.password;

  try {
    const checkResult: QueryResult<Express.User> = await db.query(
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
          const result: QueryResult<Express.User> = await db.query(
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

app.get("/auth-status", async (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    res.json({ authenticated: true, user: req.user });
  } else {
    res.json({ authenticated: false, user: null });
  }
});

app.get("/api/friends", async (req: Request, res: Response) => {
  if (req.user) {
    const userId = req.user.user_id;
    try {
      const friends: QueryResult<Express.User[]> = await db.query(
        `SELECT u.user_id, u.username 
            FROM friend f 
            JOIN users u ON f.friend_user_id = u.user_id 
            WHERE f.user_id = $1 
            UNION 
            SELECT u.user_id, u.username 
            FROM friend f 
            JOIN users u ON f.user_id = u.user_id 
            WHERE f.friend_user_id = $1`,
        [userId]
      );

      res.json(friends.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error fetching friends" });
    }
  }
});

app.get("/api/messages", async (req: Request, res: Response) => {
  if (req.user) {
    const userId = req.user.user_id;
    const friendIdString = req.query.friend_id as string;
    try {
      const friendId = parseInt(friendIdString, 10);
      const result: QueryResult<Message> = await db.query(
        "SELECT * FROM data WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)",
        [userId, friendId]
      );
      res.json({ messages: result.rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error fetching messages" });
    }
  }
});

app.get("/api/getDetails", async (req: Request, res: Response) => {
  if (req.user) {
    const friendId = parseInt(req.query.friendId as string);
    if (isNaN(friendId)) {
      res.status(400).json({ message: "Invalid friend ID" });
      return;
    }
    try {
      const result: QueryResult<{ username: string; bio: string }> =
        await db.query("SELECT username, bio FROM users WHERE user_id = $1", [
          friendId,
        ]);
      if (result.rows.length === 0) {
        res.status(404).json({ message: "Friend not found" });
        return;
      }
      res.json({ details: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error fetching details" });
    }
  }
});

interface AddFriendRequest {
  friendUID: number;
}

app.post(
  "/api/sendFriendReq",
  async (
    req: Request<{}, {}, AddFriendRequest>,
    res: Response
  ): Promise<void> => {
    if (req.user) {
      const { friendUID } = req.body;
      const userId = req.user.user_id;
      if (!friendUID) {
        res.status(400).json({ error: "Friend's UID is required" });
        return;
      }
      try {
        const friendResult: QueryResult<Express.User> = await db.query(
          "SELECT user_id FROM users WHERE UID = $1",
          [friendUID]
        );
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
        const existingFriend: QueryResult = await db.query(
          "SELECT * FROM friend WHERE user_id = $1 AND friend_user_id = $2",
          [userId, friendId]
        );
        if (existingFriend.rows.length > 0) {
          res.status(400).json({ error: "Friendship already exists" });
          return;
        }
        const existingRequest: QueryResult = await db.query(
          "SELECT * FROM friend_req WHERE user_id = $1 AND friend_id = $2 AND status = 'pending'",
          [userId, friendId]
        );
        if (existingRequest.rows.length > 0) {
          res.status(400).json({ error: "Friend request already sent" });
          return;
        }

        const result: QueryResult<friends> = await db.query(
          "INSERT INTO friend_req (user_id, friend_id) VALUES ($1, $2) RETURNING *",
          [userId, friendId]
        );
        res.json(result.rows[0]);
      } catch (error) {
        console.error("Error adding friend", error);
        res.status(500).json({ error: "Failed to add friend." });
      }
    }
  }
);

app.get("/friendReqs", async (req: Request, res: Response): Promise<void> => {
  if (req.user) {
    const userId = req.user.user_id;
    try {
      const friendRequests: QueryResult = await db.query(
        `SELECT friend_req.*, users.username 
           FROM friend_req 
           JOIN users ON friend_req.user_id = users.user_id 
           WHERE friend_req.friend_id = $1 AND friend_req.status = 'pending'`,
        [userId]
      );
      res.json(friendRequests.rows);
    } catch (error) {
      console.error("Error fetching friend requests", error);
      res.status(500).json({ error: "Failed to fetch friend requests." });
    }
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
});

app.post('/api/acceptRequest/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ message: 'Invalid request ID' });
    return;
  }
  try {
    const result = await db.query(`
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
    await db.query(insertFriendshipQuery, [user_id, friend_id]);
    res.status(200).json({ message: 'Friend request accepted successfully' });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/rejectRequest/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ message: 'Invalid request ID' });
    return;
  }
  try {
    const result = await db.query(`
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
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post(
  "/api/sendMessage",
  async (req: Request<{}, {}, Message>, res: Response): Promise<void> => {
    if (req.user) {
      const { message, friend_id } = req.body;
      const userId = req.user.user_id;
      if (!message || !friend_id) {
        res.status(400).json({ error: "Message and friendId are required." });
        return;
      }
      try {
        const result: QueryResult<Message> = await db.query(
          "INSERT INTO data (user_id, friend_id, message, time) VALUES ($1, $2, $3, NOW()) RETURNING *",
          [userId, friend_id, message]
        );
        res.json(result.rows[0]);
      } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: "Failed to send a message." });
      }
    }
  }
);

app.delete("/api/messages/:id", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const messageId = parseInt(req.params.id, 10);
  try {
    await db.query("DELETE FROM data WHERE message_id = $1 AND user_id = $2", [
      messageId,
      req.user.user_id,
    ]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting message" });
  }
});

app.patch("/api/messages/:id", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const messageId = parseInt(req.params.id, 10);
  const { editedMessage } = req.body as { editedMessage: string };
  try {
    const result: QueryResult<Message> = await db.query(
      "UPDATE data SET message = $1 WHERE message_id = $2 AND user_id = $3 RETURNING *",
      [editedMessage, messageId, req.user.user_id]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ message: "Message not found or not authorized" });
      return;
    }
    const updatedMessage = result.rows[0];
    res.status(200).json(updatedMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error editing message" });
  }
});

app.patch("/api/editUsername", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const userId = req.user.user_id;
  const { newusername } = req.body as { newusername: string };
  try {
    const result: QueryResult<Message> = await db.query(
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

app.patch("/api/editBio", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const userId = req.user.user_id;
  const { newBio } = req.body as { newBio: string };
  try {
    const result: QueryResult<Message> = await db.query(
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

passport.use(
  new Strategy(async (username, password, cb) => {
    try {
      const result: QueryResult<Express.User> = await db.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );
      console.log("Query result:", result.rows);
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

app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "..", "..", "React app", "build", "index.html")
  );
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

passport.serializeUser((user: Express.User, done) => {
  done(null, user.user_id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const result: QueryResult<Express.User> = await db.query(
      "SELECT * FROM users WHERE user_id = $1",
      [id]
    );
    const user = result.rows[0];
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
