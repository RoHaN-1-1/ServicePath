import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  loginSchema,
  insertUserSchema,
  insertUserProfileSchema,
  insertVolunteerHourSchema,
  insertReflectionSchema,
} from "@shared/schema";
import { generateRecommendations } from "./openai";
import bcrypt from "bcryptjs";

// Hardcoded credentials
const HARDCODED_USERNAME = "student";
const HARDCODED_PASSWORD = "password123";

// Middleware to check authentication
function requireAuth(req: Request, res: Response, next: Function) {
  const sessionId = req.cookies.sessionId;
  
  if (!sessionId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const userId = storage.getSession(sessionId);
  
  if (!userId) {
    return res.status(401).json({ error: "Session expired or invalid" });
  }

  // Attach userId to request for use in route handlers
  (req as any).userId = userId;
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // POST /api/login - Validate credentials
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const credentials = loginSchema.parse(req.body);
      
      // Get user by username
      let user = await storage.getUserByUsername(credentials.username);
      
      // If hardcoded demo account and doesn't exist, create it with hashed password
      if (!user && credentials.username === HARDCODED_USERNAME) {
        const hashedPassword = await bcrypt.hash(HARDCODED_PASSWORD, 10);
        user = await storage.createUser({
          username: HARDCODED_USERNAME,
          password: hashedPassword,
        });
      }
      
      // Validate user exists and password matches
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Compare password with hashed password
      const isValidPassword = await bcrypt.compare(credentials.password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Create session
      const sessionId = storage.createSession(user.id);
      
      // Set cookie
      res.cookie("sessionId", sessionId, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: "lax",
        path: "/",
      });
      
      res.json({ success: true, username: user.username });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // POST /api/register - Register new user
  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      // Validate with insertUserSchema (only username and password)
      const credentials = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(credentials.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      // Hash password before storing
      const hashedPassword = await bcrypt.hash(credentials.password, 10);
      
      // Create new user with hashed password
      const user = await storage.createUser({
        username: credentials.username,
        password: hashedPassword,
      });
      
      res.json({ success: true, username: user.username });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // GET /api/me - Verify current session and get user info
  app.get("/api/me", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Return username and createdAt, but not password
      res.json({ 
        username: user.username,
        createdAt: user.createdAt
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/logout - Clear session
  app.post("/api/logout", (req: Request, res: Response) => {
    const sessionId = req.cookies.sessionId;
    
    if (sessionId) {
      storage.deleteSession(sessionId);
    }
    
    res.clearCookie("sessionId");
    res.json({ success: true });
  });

  // GET /api/profile - Get user profile
  app.get("/api/profile", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const profile = await storage.getProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/profile - Create or update user profile
  app.post("/api/profile", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const profileData = insertUserProfileSchema.parse(req.body);
      
      const existingProfile = await storage.getProfile(userId);
      const profile = existingProfile
        ? await storage.updateProfile(userId, profileData)
        : await storage.createProfile(userId, profileData);

      res.json(profile);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // GET /api/opportunities - Get all volunteer opportunities
  app.get("/api/opportunities", async (req: Request, res: Response) => {
    try {
      const opportunities = await storage.getAllOpportunities();
      res.json(opportunities);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/search - Search volunteer opportunities
  app.get("/api/search", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query required" });
      }

      const opportunities = await storage.searchOpportunities(query);
      res.json(opportunities);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/recommend - Get AI-powered recommendations
  app.get("/api/recommend", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const profile = await storage.getProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ error: "Profile not found. Please complete the quiz first." });
      }

      const opportunities = await storage.getAllOpportunities();
      const recommendations = await generateRecommendations(profile, opportunities);

      res.json(recommendations);
    } catch (error: any) {
      console.error("Recommendation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/hours - Get user's volunteer hours
  app.get("/api/hours", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const hours = await storage.getHours(userId);
      res.json(hours);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/hours - Add volunteer hours
  app.post("/api/hours", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const hourData = insertVolunteerHourSchema.parse(req.body);
      const hour = await storage.addHour(userId, hourData);

      res.json(hour);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // GET /api/reflections - Get user's reflections
  app.get("/api/reflections", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const reflections = await storage.getReflections(userId);
      // Sort by date, newest first
      reflections.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      res.json(reflections);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/reflections - Add a reflection
  app.post("/api/reflections", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const reflectionData = insertReflectionSchema.parse(req.body);
      const reflection = await storage.addReflection(userId, reflectionData);

      res.json(reflection);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // POST /api/share - Generate shareable link
  app.post("/api/share", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const hours = await storage.getHours(userId);
      const reflections = await storage.getReflections(userId);
      
      const totalHours = hours.reduce((sum, h) => sum + h.hours, 0);
      const verifiedHours = hours.filter(h => h.verified).reduce((sum, h) => sum + h.hours, 0);
      
      const summary = `Volunteer Service Summary: ${totalHours} total hours (${verifiedHours} verified), ${hours.length} activities, ${reflections.length} reflections`;
      
      const shareLink = await storage.createShareLink(userId, summary);
      
      // Generate a shareable URL (in production this would be a real URL)
      const link = `${req.protocol}://${req.get('host')}/share/${shareLink.id}`;

      res.json({ link });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
