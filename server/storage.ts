import {
  type User,
  type InsertUser,
  type UserProfile,
  type InsertUserProfile,
  type VolunteerOpportunity,
  type InsertOpportunity,
  type VolunteerHour,
  type InsertVolunteerHour,
  type Reflection,
  type InsertReflection,
  type ShareableLink,
  type Announcement,
} from "@shared/schema";
import { randomUUID } from "crypto";

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
  getOpportunitiesByOrganization(organizationId: string): Promise<VolunteerOpportunity[]>;
  createOpportunity(organizationId: string, opportunity: InsertOpportunity, hostedBy: string): Promise<VolunteerOpportunity>;
  updateOpportunity(id: string, organizationId: string, opportunity: InsertOpportunity): Promise<VolunteerOpportunity | undefined>;
  deleteOpportunity(id: string, organizationId: string): Promise<boolean>;
  
  // Hours methods
  getHours(userId: string): Promise<VolunteerHour[]>;
  addHour(userId: string, hour: InsertVolunteerHour): Promise<VolunteerHour>;
  deleteHour(userId: string, hourId: string): Promise<boolean>;
  
  // Reflections methods
  getReflections(userId: string): Promise<Reflection[]>;
  addReflection(userId: string, reflection: InsertReflection): Promise<Reflection>;
  deleteReflection(userId: string, reflectionId: string): Promise<boolean>;
  
  // Share methods
  createShareLink(userId: string, content: string): Promise<ShareableLink>;
  
  // Announcement methods
  getAnnouncements(organizationId: string): Promise<Announcement[]>;
  createAnnouncement(organizationId: string, content: string): Promise<Announcement>;
  deleteAnnouncement(organizationId: string, announcementId: string): Promise<boolean>;
  
  // Organization profile methods
  updateOrganizationBio(userId: string, bio: string): Promise<User | undefined>;
  
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
  private announcements: Map<string, Announcement[]>; // organizationId -> announcements

  constructor() {
    this.users = new Map();
    this.profiles = new Map();
    this.hours = new Map();
    this.reflections = new Map();
    this.shareLinks = new Map();
    this.sessions = new Map();
    this.announcements = new Map();
    
    // Start with empty opportunities - organizations create their own
    this.opportunities = [];
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
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      accountType: insertUser.accountType || "student",
      organizationName: insertUser.organizationName || null,
      contactEmail: insertUser.contactEmail || null,
      organizationDescription: insertUser.organizationDescription || null,
    };
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

  async getOpportunitiesByOrganization(organizationId: string): Promise<VolunteerOpportunity[]> {
    return this.opportunities.filter(opp => opp.organizationId === organizationId);
  }

  async createOpportunity(organizationId: string, opportunity: InsertOpportunity, hostedBy: string): Promise<VolunteerOpportunity> {
    const newOpportunity: VolunteerOpportunity = {
      id: randomUUID(),
      ...opportunity,
      hostedBy,
      organizationId,
      createdAt: new Date().toISOString(),
    };
    this.opportunities.push(newOpportunity);
    return newOpportunity;
  }

  async updateOpportunity(id: string, organizationId: string, opportunity: InsertOpportunity): Promise<VolunteerOpportunity | undefined> {
    const index = this.opportunities.findIndex(opp => opp.id === id && opp.organizationId === organizationId);
    if (index === -1) return undefined;
    
    const existingOpp = this.opportunities[index];
    const updatedOpportunity: VolunteerOpportunity = {
      ...existingOpp,
      ...opportunity,
    };
    this.opportunities[index] = updatedOpportunity;
    return updatedOpportunity;
  }

  async deleteOpportunity(id: string, organizationId: string): Promise<boolean> {
    const index = this.opportunities.findIndex(opp => opp.id === id && opp.organizationId === organizationId);
    if (index === -1) return false;
    
    this.opportunities.splice(index, 1);
    return true;
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

  async deleteHour(userId: string, hourId: string): Promise<boolean> {
    const userHours = this.hours.get(userId) || [];
    const index = userHours.findIndex(h => h.id === hourId);
    if (index === -1) return false;
    
    userHours.splice(index, 1);
    this.hours.set(userId, userHours);
    return true;
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

  async deleteReflection(userId: string, reflectionId: string): Promise<boolean> {
    const userReflections = this.reflections.get(userId) || [];
    const index = userReflections.findIndex(r => r.id === reflectionId);
    if (index === -1) return false;
    
    userReflections.splice(index, 1);
    this.reflections.set(userId, userReflections);
    return true;
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

  // Announcement methods
  async getAnnouncements(organizationId: string): Promise<Announcement[]> {
    return this.announcements.get(organizationId) || [];
  }

  async createAnnouncement(organizationId: string, content: string): Promise<Announcement> {
    const announcement: Announcement = {
      id: randomUUID(),
      organizationId,
      content,
      createdAt: new Date().toISOString(),
    };
    const orgAnnouncements = this.announcements.get(organizationId) || [];
    orgAnnouncements.unshift(announcement); // Add to beginning (newest first)
    this.announcements.set(organizationId, orgAnnouncements);
    return announcement;
  }

  async deleteAnnouncement(organizationId: string, announcementId: string): Promise<boolean> {
    const orgAnnouncements = this.announcements.get(organizationId) || [];
    const index = orgAnnouncements.findIndex(a => a.id === announcementId);
    if (index === -1) return false;
    
    orgAnnouncements.splice(index, 1);
    this.announcements.set(organizationId, orgAnnouncements);
    return true;
  }

  // Organization profile methods
  async updateOrganizationBio(userId: string, bio: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      organizationDescription: bio,
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
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
    
    // Delete announcements (for org accounts)
    this.announcements.delete(userId);
    
    // Delete all sessions
    this.deleteAllUserSessions(userId);
  }
}

export const storage = new MemStorage();
