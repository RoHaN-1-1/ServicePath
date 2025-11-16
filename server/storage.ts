import {
  type User,
  type InsertUser,
  type UserProfile,
  type InsertUserProfile,
  type VolunteerOpportunity,
  type VolunteerHour,
  type InsertVolunteerHour,
  type Reflection,
  type InsertReflection,
  type ShareableLink,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { readFileSync } from "fs";
import { join } from "path";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  deleteUser(userId: string): Promise<void>;
  
  // Profile methods
  getProfile(userId: string): Promise<UserProfile | undefined>;
  createProfile(userId: string, profile: InsertUserProfile): Promise<UserProfile>;
  updateProfile(userId: string, profile: InsertUserProfile): Promise<UserProfile>;
  
  // Opportunities methods
  getAllOpportunities(): Promise<VolunteerOpportunity[]>;
  searchOpportunities(query: string): Promise<VolunteerOpportunity[]>;
  
  // Hours methods
  getHours(userId: string): Promise<VolunteerHour[]>;
  addHour(userId: string, hour: InsertVolunteerHour): Promise<VolunteerHour>;
  
  // Reflections methods
  getReflections(userId: string): Promise<Reflection[]>;
  addReflection(userId: string, reflection: InsertReflection): Promise<Reflection>;
  
  // Share methods
  createShareLink(userId: string, content: string): Promise<ShareableLink>;
  
  // Session methods
  createSession(userId: string): string;
  getSession(sessionId: string): string | undefined;
  deleteSession(sessionId: string): void;
  deleteAllUserSessions(userId: string): void;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private profiles: Map<string, UserProfile>;
  private opportunities: VolunteerOpportunity[];
  private hours: Map<string, VolunteerHour[]>;
  private reflections: Map<string, Reflection[]>;
  private shareLinks: Map<string, ShareableLink>;
  private sessions: Map<string, string>; // sessionId -> userId

  constructor() {
    this.users = new Map();
    this.profiles = new Map();
    this.hours = new Map();
    this.reflections = new Map();
    this.shareLinks = new Map();
    this.sessions = new Map();
    
    // Load opportunities from CSV file
    this.opportunities = this.loadOpportunitiesFromCSV();
  }

  private loadOpportunitiesFromCSV(): VolunteerOpportunity[] {
    try {
      const csvPath = join(process.cwd(), "volunteer_opportunities.csv");
      const csvContent = readFileSync(csvPath, "utf-8");
      const lines = csvContent.trim().split("\n").slice(1); // Skip header
      
      const opportunities: VolunteerOpportunity[] = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Simple CSV parser (handles quoted fields)
        const parts: string[] = [];
        let current = '';
        let inQuotes = false;
        
        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            parts.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        parts.push(current.trim());
        
        if (parts.length < 8) continue;
        
        const [name, host, description, hours, age, requirements, field, days] = parts;
        
        // Map field to categories
        const fieldMap: Record<string, string[]> = {
          "Environment & Nature": ["environment"],
          "Education & Training": ["tutoring", "youth"],
          "Animal Welfare": ["animals"],
          "Arts & Culture": ["arts"],
          "Technology & STEM": ["technology"],
          "Community Service": ["community"],
          "Senior Care": ["seniors"],
          "Youth Mentoring": ["youth"],
        };
        
        const category = fieldMap[field] || ["community"];
        
        // Determine if remote
        const remote = requirements.toLowerCase().includes("remote") || 
                      requirements.toLowerCase().includes("virtual") ||
                      requirements.toLowerCase().includes("online");
        
        opportunities.push({
          id: String(i + 1),
          title: name,
          location: remote ? "Remote" : requirements.includes("onsite") ? "Hybrid" : "In-person",
          hostedBy: host,
          requirements,
          description,
          category,
          skills: [],
          timeCommitment: `${hours} hours`,
          remote,
          tags: ["service_hours"],
        });
      }
      
      console.log(`Loaded ${opportunities.length} opportunities from CSV`);
      return opportunities;
    } catch (error) {
      console.error("Error loading CSV:", error);
      // Fallback to minimal opportunities if CSV fails
      return [{
        id: "1",
        title: "Park Cleanup",
        location: "Riverside Park",
        hostedBy: "GreenEarth Org",
        requirements: "Ages 14+, Saturday morning, in-person",
        description: "Join us to clean up the local park and learn about ecosystem restoration.",
        category: ["environment", "community"],
        skills: ["physical"],
        timeCommitment: "Saturday morning, 3 hours",
        remote: false,
        tags: ["service_hours"],
      }];
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  // Profile methods
  async getProfile(userId: string): Promise<UserProfile | undefined> {
    return this.profiles.get(userId);
  }

  async createProfile(userId: string, profile: InsertUserProfile): Promise<UserProfile> {
    const userProfile: UserProfile = {
      id: randomUUID(),
      userId,
      ...profile,
    };
    this.profiles.set(userId, userProfile);
    return userProfile;
  }

  async updateProfile(userId: string, profile: InsertUserProfile): Promise<UserProfile> {
    const existingProfile = this.profiles.get(userId);
    const userProfile: UserProfile = {
      id: existingProfile?.id || randomUUID(),
      userId,
      ...profile,
    };
    this.profiles.set(userId, userProfile);
    return userProfile;
  }

  // Opportunities methods
  async getAllOpportunities(): Promise<VolunteerOpportunity[]> {
    return this.opportunities;
  }

  async searchOpportunities(query: string): Promise<VolunteerOpportunity[]> {
    const lowerQuery = query.toLowerCase();
    return this.opportunities.filter(opp =>
      opp.title.toLowerCase().includes(lowerQuery) ||
      opp.description.toLowerCase().includes(lowerQuery) ||
      opp.category.some(cat => cat.toLowerCase().includes(lowerQuery)) ||
      opp.skills.some(skill => skill.toLowerCase().includes(lowerQuery)) ||
      opp.hostedBy.toLowerCase().includes(lowerQuery)
    );
  }

  // Hours methods
  async getHours(userId: string): Promise<VolunteerHour[]> {
    return this.hours.get(userId) || [];
  }

  async addHour(userId: string, hour: InsertVolunteerHour): Promise<VolunteerHour> {
    const newHour: VolunteerHour = {
      id: randomUUID(),
      userId,
      ...hour,
    };
    const userHours = this.hours.get(userId) || [];
    userHours.push(newHour);
    this.hours.set(userId, userHours);
    return newHour;
  }

  // Reflections methods
  async getReflections(userId: string): Promise<Reflection[]> {
    return this.reflections.get(userId) || [];
  }

  async addReflection(userId: string, reflection: InsertReflection): Promise<Reflection> {
    const newReflection: Reflection = {
      id: randomUUID(),
      userId,
      date: new Date().toISOString(),
      ...reflection,
    };
    const userReflections = this.reflections.get(userId) || [];
    userReflections.push(newReflection);
    this.reflections.set(userId, userReflections);
    return newReflection;
  }

  // Share methods
  async createShareLink(userId: string, content: string): Promise<ShareableLink> {
    const link: ShareableLink = {
      id: randomUUID(),
      userId,
      content,
      createdAt: new Date().toISOString(),
    };
    this.shareLinks.set(link.id, link);
    return link;
  }

  // Session methods
  createSession(userId: string): string {
    const sessionId = randomUUID();
    this.sessions.set(sessionId, userId);
    return sessionId;
  }

  getSession(sessionId: string): string | undefined {
    return this.sessions.get(sessionId);
  }

  deleteSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  deleteAllUserSessions(userId: string): void {
    // Delete all sessions for a specific user
    const sessionsToDelete = Array.from(this.sessions.entries())
      .filter(([_, uid]) => uid === userId)
      .map(([sessionId]) => sessionId);
    
    sessionsToDelete.forEach(sessionId => this.sessions.delete(sessionId));
  }

  // Delete user and all associated data
  async deleteUser(userId: string): Promise<void> {
    // Delete user
    this.users.delete(userId);
    
    // Delete profile
    this.profiles.delete(userId);
    
    // Delete hours
    this.hours.delete(userId);
    
    // Delete reflections
    this.reflections.delete(userId);
    
    // Delete share links
    const linksToDelete = Array.from(this.shareLinks.entries())
      .filter(([_, link]) => link.userId === userId)
      .map(([linkId]) => linkId);
    
    linksToDelete.forEach(linkId => this.shareLinks.delete(linkId));
    
    // Delete all sessions
    this.deleteAllUserSessions(userId);
  }
}

export const storage = new MemStorage();
