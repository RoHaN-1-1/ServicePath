import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
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
}

// Volunteer Hour Entry
export interface VolunteerHour {
  id: string;
  userId: string;
  activityTitle: string;
  date: string;
  hours: number;
  verified: boolean;
  opportunityId?: string;
}

export const insertVolunteerHourSchema = z.object({
  activityTitle: z.string().min(1, "Activity title required"),
  date: z.string().min(1, "Date required"),
  hours: z.number().min(0.5, "Minimum 0.5 hours").max(24, "Maximum 24 hours"),
  verified: z.boolean().default(false),
  opportunityId: z.string().optional(),
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
});

export type LoginCredentials = z.infer<typeof loginSchema>;
