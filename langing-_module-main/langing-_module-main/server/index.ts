import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";
import { initializeFirebase, getDb } from "./firebase-init";
import passport from "./auth";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { handleDemo } from "./routes/demo";

console.log("[SERVER] Initializing Firebase...");
initializeFirebase();

const JWT_SECRET = process.env.JWT_SECRET!;
const DASHBOARD_URL = "http://localhost:8081";

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

function generateToken(user: { id: string; name: string; email: string }) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

async function ensureTestUser(db: any) {
  try {
    const userDoc = await db.collection("users").doc("test@example.com").get();
    if (!userDoc.exists) {
      const hashedPassword = await bcrypt.hash("password123", 10);
      await db.collection("users").doc("test@example.com").set({
        id: "test-user-1",
        name: "Test User",
        email: "test@example.com",
        password: hashedPassword,
        provider: "local",
        createdAt: new Date(),
      });
      console.log("[TEST USER] Created: test@example.com / password123");
    }
  } catch (error) {
    console.error("[TEST USER] Error:", error);
  }
}

export function createServer() {
  const app = express();
  const db = getDb();

  ensureTestUser(db);

  app.use(
    cors({
      origin: ["http://localhost:8081"],
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "your-secret-key",
      resave: false,
      saveUninitialized: false,
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // ── Google OAuth ──────────────────────────────────────────────────────────
  app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
      const user = req.user as any;
      const token = generateToken({
        id: user.id,
        name: user.displayName ?? user.name,
        email: user.email,
      });
      res.redirect(`${DASHBOARD_URL}/auth/verify?token=${token}`);
    }
  );

  // ── Email / Password Sign-up ──────────────────────────────────────────────
  app.post("/auth/signup", async (req, res) => {
    try {
      const { name, email, password } = req.body;

      const userDoc = await db.collection("users").doc(email).get();
      if (userDoc.exists) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = Date.now().toString();

      await db.collection("users").doc(email).set({
        id: userId,
        name,
        email,
        password: hashedPassword,
        createdAt: new Date(),
      });

      const token = generateToken({ id: userId, name, email });
      res.json({ token });
    } catch (error) {
      console.error("[SIGNUP]", error);
      res.status(500).json({ message: "Signup failed" });
    }
  });

  // ── Email / Password Sign-in ──────────────────────────────────────────────
  app.post("/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      const userDoc = await db.collection("users").doc(email).get();
      if (!userDoc.exists) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const userData = userDoc.data() as User;
      const isValid = await bcrypt.compare(password, userData.password);

      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken({
        id: userData.id,
        name: userData.name,
        email: userData.email,
      });
      res.json({ token });
    } catch (error) {
      console.error("[LOGIN]", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // ── Logout ────────────────────────────────────────────────────────────────
  app.get("/auth/logout", (req, res) => {
    req.logout(() => {
      res.redirect("/");
    });
  });

  // ── Misc ──────────────────────────────────────────────────────────────────
  app.get("/api/ping", (_req, res) => {
    res.json({ message: process.env.PING_MESSAGE ?? "ping" });
  });

  app.get("/api/demo", handleDemo);

  return app;
}
