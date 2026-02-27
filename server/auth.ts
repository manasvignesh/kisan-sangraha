import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "../shared/schema";
import pgSession from "connect-pg-simple";
import { Pool } from "pg";

declare global {
    namespace Express {
        interface User extends SelectUser { }
    }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
    const PgSession = pgSession(session);
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });

    const sessionSettings: session.SessionOptions = {
        secret: process.env.SESSION_SECRET || "kisan_sangraha_super_secret",
        resave: false,
        saveUninitialized: false,
        store: new PgSession({
            pool,
            createTableIfMissing: true,
        }),
        cookie: {
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        },
    };

    if (app.get("env") === "production") {
        app.set("trust proxy", 1);
    }

    app.use(session(sessionSettings));
    app.use(passport.initialize());
    app.use(passport.session());

    // Passport uses 'username' field from the POST body
    passport.use(
        new LocalStrategy(async (username, password, done) => {
            try {
                // Allow lookup by username (which could be an email or phone number)
                const user = await storage.getUserByUsername(username.trim().toLowerCase());
                if (!user) {
                    return done(null, false, { message: "No account found with that username or email." });
                }
                const isValid = await comparePasswords(password, user.password);
                if (!isValid) {
                    return done(null, false, { message: "Incorrect password. Please try again." });
                }
                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }),
    );

    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id: string, done) => {
        try {
            const user = await storage.getUser(id);
            done(null, user ?? null);
        } catch (err) {
            done(err);
        }
    });

    // ─── POST /api/auth/register ───────────────────────────────────────────────
    app.post("/api/auth/register", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { username, password, role } = req.body;

            // Validate required fields
            if (!username || typeof username !== "string" || username.trim().length < 3) {
                return res.status(400).json({ message: "Username must be at least 3 characters." });
            }
            if (!password || typeof password !== "string" || password.length < 6) {
                return res.status(400).json({ message: "Password must be at least 6 characters." });
            }

            const validRoles = ["farmer", "provider"];
            const normalizedRole = role && validRoles.includes(role) ? role : "farmer";
            const normalizedUsername = username.trim().toLowerCase();

            // Check if username already taken
            const existing = await storage.getUserByUsername(normalizedUsername);
            if (existing) {
                return res.status(400).json({ message: "An account with that username or email already exists." });
            }

            // Hash password & create user
            const hashedPassword = await hashPassword(password);
            const user = await storage.createUser({
                username: normalizedUsername,
                password: hashedPassword,
                role: normalizedRole,
            });

            // Log user in immediately after registration
            req.login(user, (err) => {
                if (err) return next(err);
                // Return user object so frontend can redirect based on role
                return res.status(201).json({
                    id: user.id,
                    username: user.username,
                    role: user.role,
                });
            });
        } catch (error: any) {
            console.error("Registration error:", error);
            next(error);
        }
    });

    // ─── POST /api/auth/login ──────────────────────────────────────────────────
    app.post("/api/auth/login", (req: Request, res: Response, next: NextFunction) => {
        // Normalize username before passport checks it
        if (req.body.username) {
            req.body.username = req.body.username.trim().toLowerCase();
        }

        passport.authenticate(
            "local",
            (err: any, user: SelectUser | false, info: { message?: string }) => {
                if (err) return next(err);
                if (!user) {
                    return res.status(401).json({
                        message: info?.message || "Invalid credentials. Please check your username and password.",
                    });
                }
                req.login(user, (loginErr) => {
                    if (loginErr) return next(loginErr);
                    return res.status(200).json({
                        id: user.id,
                        username: user.username,
                        role: user.role,
                    });
                });
            },
        )(req, res, next);
    });

    // ─── POST /api/auth/logout ─────────────────────────────────────────────────
    app.post("/api/auth/logout", (req: Request, res: Response, next: NextFunction) => {
        req.logout((err) => {
            if (err) return next(err);
            res.sendStatus(200);
        });
    });

    // ─── GET /api/auth/me ──────────────────────────────────────────────────────
    app.get("/api/auth/me", (req: Request, res: Response) => {
        if (!req.isAuthenticated() || !req.user) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        const { id, username, role } = req.user;
        return res.json({ id, username, role });
    });
}
