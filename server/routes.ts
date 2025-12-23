import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  loginSchema,
  insertUserSchema,
  insertUserProfileSchema,
  insertVolunteerHourSchema,
  insertReflectionSchema,
  insertOpportunitySchema,
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
          accountType: "student", // Ensure demo account is a student
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
      
      // Return account type for frontend routing (default to "student" for legacy users)
      res.json({ 
        success: true, 
        username: user.username,
        accountType: user.accountType || "student"
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // POST /api/register - Register new user
  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      const { username, password, accountType, organizationName, contactEmail, organizationDescription } = req.body;
      
      // Validate username
      if (!username || typeof username !== "string" || username.length < 3) {
        return res.status(400).json({ error: "Username must be at least 3 characters" });
      }
      
      // Validate password
      if (!password || typeof password !== "string" || password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }
      
      // Validate account type
      const validAccountType = accountType === "organization" ? "organization" : "student";
      
      // Validate organization fields if applicable
      if (validAccountType === "organization") {
        if (!organizationName || typeof organizationName !== "string" || organizationName.length < 2) {
          return res.status(400).json({ error: "Organization name is required (at least 2 characters)" });
        }
        if (contactEmail && typeof contactEmail === "string" && contactEmail.length > 0) {
          // Basic email format validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(contactEmail)) {
            return res.status(400).json({ error: "Invalid email format" });
          }
        }
      }
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      // Hash password before storing
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create new user with hashed password
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        accountType: validAccountType,
        organizationName: validAccountType === "organization" ? organizationName : undefined,
        contactEmail: validAccountType === "organization" && contactEmail ? contactEmail : undefined,
        organizationDescription: validAccountType === "organization" && organizationDescription ? organizationDescription : undefined,
      });
      
      // Automatically log in the user after registration
      const sessionId = storage.createSession(user.id);
      
      res.cookie("sessionId", sessionId, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: "lax",
        path: "/",
      });
      
      res.json({ success: true, username: user.username, accountType: user.accountType });
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
      
      // Return user info, but not password
      // Default accountType to "student" for legacy users without accountType
      res.json({ 
        username: user.username,
        createdAt: user.createdAt,
        accountType: user.accountType || "student",
        organizationName: user.organizationName || null,
        contactEmail: user.contactEmail || null,
        organizationDescription: user.organizationDescription || null,
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

  // POST /api/account/delete - Delete user account with password verification
  app.post("/api/account/delete", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ error: "Password required" });
      }

      // Get user to verify password
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Incorrect password" });
      }

      // Delete user and all associated data
      await storage.deleteUser(userId);

      // Clear session cookie
      res.clearCookie("sessionId");
      res.json({ success: true, message: "Account deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
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

  // DELETE /api/hours/:id - Delete a volunteer hour entry
  app.delete("/api/hours/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const hourId = req.params.id;
      
      const deleted = await storage.deleteHour(userId, hourId);
      
      if (!deleted) {
        return res.status(404).json({ error: "Hour entry not found" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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

  // DELETE /api/reflections/:id - Delete a reflection
  app.delete("/api/reflections/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const reflectionId = req.params.id;
      
      const deleted = await storage.deleteReflection(userId, reflectionId);
      
      if (!deleted) {
        return res.status(404).json({ error: "Reflection not found" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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

  // Middleware to check if user is an organization
  async function requireOrganization(req: Request, res: Response, next: Function) {
    try {
      const userId = (req as any).userId;
      
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      
      // Strictly check account type - must be "organization"
      if (user.accountType !== "organization") {
        return res.status(403).json({ error: "Only organizations can manage opportunities" });
      }
      
      (req as any).user = user;
      next();
    } catch (error: any) {
      console.error("requireOrganization error:", error);
      return res.status(500).json({ error: "Authorization check failed" });
    }
  }

  // GET /api/organization/opportunities - Get opportunities created by this organization
  app.get("/api/organization/opportunities", requireAuth, requireOrganization, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const opportunities = await storage.getOpportunitiesByOrganization(userId);
      res.json(opportunities);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/organization/opportunities - Create a new opportunity
  app.post("/api/organization/opportunities", requireAuth, requireOrganization, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const user = (req as any).user;
      const opportunityData = insertOpportunitySchema.parse(req.body);
      
      const hostedBy = user.organizationName || user.username;
      const opportunity = await storage.createOpportunity(userId, opportunityData, hostedBy);
      
      res.json(opportunity);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // PUT /api/organization/opportunities/:id - Update an opportunity
  app.put("/api/organization/opportunities/:id", requireAuth, requireOrganization, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const opportunityId = req.params.id;
      
      // Validate input first before any storage operations
      const parseResult = insertOpportunitySchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.errors[0]?.message || "Invalid opportunity data" });
      }
      
      const opportunity = await storage.updateOpportunity(opportunityId, userId, parseResult.data);
      
      if (!opportunity) {
        return res.status(404).json({ error: "Opportunity not found or you don't have permission to edit it" });
      }
      
      res.json(opportunity);
    } catch (error: any) {
      console.error("Update opportunity error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/organization/opportunities/:id - Delete an opportunity
  app.delete("/api/organization/opportunities/:id", requireAuth, requireOrganization, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const opportunityId = req.params.id;
      
      // Validate opportunityId
      if (!opportunityId || typeof opportunityId !== "string") {
        return res.status(400).json({ error: "Invalid opportunity ID" });
      }
      
      const deleted = await storage.deleteOpportunity(opportunityId, userId);
      
      if (!deleted) {
        return res.status(404).json({ error: "Opportunity not found or you don't have permission to delete it" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete opportunity error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
