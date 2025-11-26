import express, { Request, Response } from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

// ⭐ GOOGLE CLIENT
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ⭐ MYSQL CONNECTION
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// --------------------------- REGISTER -----------------------------
app.post("/register", async (req: Request, res: Response) => {
  try {
    const { fullname, email, username, password, role } = req.body;

    if (!fullname || !email || !username || !password)
      return res.json({ success: false, message: "All fields are required." });

    const hashed = await bcrypt.hash(password, 10);

    const [rows]: any = await db.query(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (rows.length > 0)
      return res.json({ success: false, message: "User already exists." });

    await db.query(
      "INSERT INTO users (fullname, email, username, password, role) VALUES (?, ?, ?, ?, ?)",
      [fullname, email, username, hashed, role]
    );

    return res.json({ success: true });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// --------------------------- LOGIN -----------------------------
app.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const [rows]: any = await db.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (rows.length === 0)
      return res.json({ success: false, message: "Invalid username." });

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.json({ success: false, message: "Incorrect password." });

    return res.json({
      success: true,
      fullname: user.fullname,
      role: user.role,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// --------------------------- GOOGLE LOGIN -----------------------------
app.post("/google-login", async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload)
      return res.json({ success: false, message: "Google auth failed." });

    const fullname = payload.name;
    const email = payload.email;

    // Check if user exists
    const [rows]: any = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    let user;

    if (rows.length === 0) {
      await db.query(
        "INSERT INTO users (fullname, email, username, password, role) VALUES (?, ?, ?, ?, ?)",
        [fullname, email, email, "", "user"]
      );

      const [newUser]: any = await db.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );
      user = newUser[0];
    } else {
      user = rows[0];
    }

    return res.json({
      success: true,
      fullname: user.fullname,
      role: user.role,
    });
  } catch (err) {
    console.error("GOOGLE LOGIN ERROR:", err);
    return res.json({ success: false, message: "Google login error." });
  }
});

// --------------------------- START SERVER -----------------------------
app.listen(4000, () => {
  console.log("🚀 Server running on port 4000");
});
