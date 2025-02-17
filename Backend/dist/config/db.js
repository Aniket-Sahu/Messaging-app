import pg from "pg";
import dotenv from "dotenv";
dotenv.config();
export const pool = new pg.Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: 5432,
});
pool.connect()
    .then(() => console.log("Connected to Database"))
    .catch((err) => console.error("Database connection error:", err));
//# sourceMappingURL=db.js.map