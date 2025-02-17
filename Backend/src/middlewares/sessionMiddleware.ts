import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "../config/db.js"; 
import dotenv from "dotenv";

dotenv.config();

const pgSession = connectPgSimple(session);

const sessionMiddleware = session({
    store: new pgSession({
        pool: pool,
        tableName: "session",
    }),
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, 
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24, 
    },
});

export { sessionMiddleware };
