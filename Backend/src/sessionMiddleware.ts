import session from "express-session";
import pg from "pg";
import connectPgSimple from "connect-pg-simple";
import dotenv from "dotenv";

dotenv.config();

const pgSession = connectPgSimple(session);

export const pool = new pg.Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: 5432,
})

const sessionMiddleware = session({
    store: new pgSession({
        pool: pool,
        tableName: "session"
    }),
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie:{
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
    },
});

export {sessionMiddleware};