import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Account types
export type AccountType = "student" | "organization";

// User table for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  accountType: text("account_type").notNull().default("student"),
  organizationName: text("organization_name"),
  contactEmail: text("contact_email"),
  organizationDescription: text("organization_description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema> & {
  accountType?: AccountType;
  organizationName?: string;
  contactEmail?: string;
  organizationDescription?: string;
};
export type User = typeof users.$inferSelect;

// User Profile - stores quiz results and preferences
export interface UserProfile {
  id: string;
  userId: string;
  interests: string[]; // e.g., ["environment", "animals", "arts", "tutoring"]
  skills: string[]; // e.g., ["social media", "tutoring", "event planning"]
  availability: string[]; // e.g., ["saturday_morning", "weekday_evening"]
  goals: string[]; // e.g., ["leadership", "service_hours", "college_application"]
  location: string; // e.g., "10 miles" or "remote"
  serviceHoursGoal?: number; // e.g., 40
}

export const insertUserProfileSchema = z.object({
  interests: z.array(z.string()).min(1, "Select at least one interest"),
  skills: z.array(z.string()).min(1, "Select at least one skill"),
  availability: z.array(z.string()).min(1, "Select at least one time slot"),
  goals: z.array(z.string()).min(1, "Select at least one goal"),
  location: z.string().min(1, "Location preference required"),
  serviceHoursGoal: z.number().optional(),
});

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;

// Volunteer Opportunity
export interface VolunteerOpportunity {
  id: string;
  title: string;
  location: string;
  hostedBy: string;
  requirements: string;
  description: string;
  category: string[]; // e.g., ["environment", "animals"]
  skills: string[]; // e.g., ["social media", "physical activity"]
  timeCommitment: string; // e.g., "Saturday morning", "1 hr/week"
  remote: boolean;
  tags: string[]; // e.g., ["college_application", "leadership"]
  organizationId?: string; // ID of organization that created this opportunity
  createdAt?: string;
}

export const insertOpportunitySchema = z.object({
  title: z.string().min(1, "Title required"),
  location: z.string().min(1, "Location required"),
  requirements: z.string().min(1, "Requirements required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.array(z.string()).min(1, "Select at least one category"),
  skills: z.array(z.string()).default([]),
  timeCommitment: z.string().min(1, "Time commitment required"),
  remote: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;

// Volunteer Hour Entry
export interface VolunteerHour {
  id: string;
  userId: string;
  activityTitle: string;
  date: string;
  hours: number;
  verified: boolean;
  opportunityId?: string;
  signature?: string; // Base64 data URL of signature image
}

export const insertVolunteerHourSchema = z.object({
  activityTitle: z.string().min(1, "Activity title required"),
  date: z.string().min(1, "Date required"),
  hours: z.number().min(0.5, "Minimum 0.5 hours").max(24, "Maximum 24 hours"),
  verified: z.boolean().default(false),
  opportunityId: z.string().optional(),
  signature: z.string().optional(),
});

export type InsertVolunteerHour = z.infer<typeof insertVolunteerHourSchema>;

// Reflection Entry
export interface Reflection {
  id: string;
  userId: string;
  opportunityId?: string;
  title: string;
  content: string;
  date: string;
}

export const insertReflectionSchema = z.object({
  opportunityId: z.string().optional(),
  title: z.string().min(1, "Title required"),
  content: z.string().min(10, "Reflection must be at least 10 characters"),
});

export type InsertReflection = z.infer<typeof insertReflectionSchema>;

// Shareable Link
export interface ShareableLink {
  id: string;
  userId: string;
  content: string; // Summary of volunteer work
  createdAt: string;
}

// Organization Announcement
export interface Announcement {
  id: string;
  organizationId: string;
  content: string;
  createdAt: string;
}

export const insertAnnouncementSchema = z.object({
  content: z.string().min(1, "Announcement content required").max(500, "Announcement too long (max 500 characters)"),
});

export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;

// AI Recommendation Response
export interface OpportunityMatch {
  opportunity: VolunteerOpportunity;
  matchScore: number; // 0-100
  matchReason: string; // AI-generated explanation
}

// Login credentials
export const loginSchema = z.object({
  username: z.string().min(1, "Username required"),
  password: z.string().min(1, "Password required"),
  accountType: z.enum(["student", "organization"]).default("student"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

// Registration credentials
export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  accountType: z.enum(["student", "organization"]).default("student"),
  organizationName: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  organizationDescription: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.accountType === "organization") {
    return data.organizationName && data.organizationName.length >= 2;
  }
  return true;
}, {
  message: "Organization name is required",
  path: ["organizationName"],
});

export type RegisterCredentials = z.infer<typeof registerSchema>;
