# VolunteerMatch Platform

## Overview

VolunteerMatch is a web application designed to help high school students discover and engage with volunteer opportunities. The platform matches students with opportunities based on their interests, skills, availability, and goals selected through an onboarding quiz. Students can track their volunteer hours, write reflections, and share their service summaries.

**Target Users:** High school students seeking meaningful volunteer experiences for personal growth, college applications, and community service requirements.

**Core Features:**
- Interest-based opportunity matching through personality quiz
- Browse opportunities by category (Environment & Nature, Education & Training, Animal Welfare, Arts & Culture, Technology & STEM, Community Service, Senior Care, Youth Mentoring)
- Volunteer hour tracking with verification status
- Reflection journaling
- Shareable service summaries
- Search and filter capabilities

**Data Source:**
- 20 volunteer opportunities loaded from `volunteer_opportunities.csv`
- Opportunities organized by 8 main categories mapped to user interest fields

**Recent Updates (November 11, 2025):**
- Fixed authentication: Cookie-based sessions now include `path: "/"` attribute
- Logo navigation: Clicking the logo/VolunteerMatch text returns to dashboard
- CSV integration: All opportunities now loaded from volunteer_opportunities.csv
- Dashboard behavior:
  - **Before quiz**: Shows "Browse by Category" section with opportunities organized by field
  - **After quiz**: Shows filtered opportunities matching user's selected interests
  - **After quiz**: "Browse by Category" moved to tools sidebar for easy access

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework:** React 18 with TypeScript using Vite as the build tool

**UI Component System:** 
- shadcn/ui component library (Radix UI primitives + Tailwind CSS)
- Material Design-inspired approach for clear information hierarchy
- Custom theme system supporting light/dark modes
- Typography using Inter or Poppins font families

**State Management:**
- TanStack Query (React Query) for server state management and caching
- React Context API for theme management
- Session storage for authentication state persistence
- React Hook Form with Zod validation for form handling

**Routing:** wouter (lightweight client-side routing)

**Key Design Decisions:**
- Component-based architecture with reusable UI primitives
- Path aliases configured (`@/`, `@shared/`, `@assets/`) for clean imports
- Responsive design with mobile-first breakpoints
- Accessibility-focused components from Radix UI

### Backend Architecture

**Framework:** Express.js with TypeScript running on Node.js

**API Design:** RESTful endpoints with JSON responses

**Session Management:**
- Cookie-based sessions using `cookie-parser`
- In-memory session storage (Map-based)
- Hardcoded authentication (username: "student", password: "password123")

**Data Storage Strategy:**
- In-memory storage using custom `MemStorage` class
- No persistent database in current implementation
- Predefined dataset of volunteer opportunities stored in memory
- Data structures follow schema definitions but aren't persisted

**Key Architectural Patterns:**
- Repository pattern via `IStorage` interface for data operations
- Separation of concerns: routes, storage, and AI logic in distinct modules
- Middleware for authentication checks
- Request/response logging for API monitoring

**Why In-Memory Storage:**
The application uses in-memory storage as a lightweight solution for the initial implementation. This allows rapid development and testing without database infrastructure overhead. The `IStorage` interface abstracts storage operations, making it straightforward to swap in a persistent database later.

### AI Integration

**Provider:** OpenAI API (GPT-5 model as of August 2025)

**Use Case:** Generating personalized opportunity recommendations

**Implementation:**
- `generateRecommendations()` function in `server/openai.ts`
- Takes user profile (interests, skills, availability, goals, location) and available opportunities
- Returns match scores (0-100) and reasoning for each opportunity
- Structured prompting for consistent JSON responses

**Rationale:** AI-powered matching provides more nuanced recommendations than keyword search alone, helping students discover opportunities they might not have considered while explaining why each match is relevant.

### Authentication & Authorization

**Current Implementation:**
- Single hardcoded user account for demonstration
- Cookie-based session management
- `requireAuth` middleware protects API routes
- Session state stored in memory (Map: sessionId → userId)

**Session Flow:**
1. User submits credentials via `/api/login`
2. Server validates against hardcoded credentials
3. Creates session with unique ID, stores in memory
4. Returns session cookie to client
5. Subsequent requests include cookie for authentication

**Limitation:** In-memory sessions are lost on server restart. This is acceptable for the current development/demo scope but would need persistence for production.

### Data Schema Design

**User Profile Structure:**
- Arrays for multi-select fields (interests, skills, availability, goals)
- Optional `serviceHoursGoal` for goal tracking
- Location preference as string

**Volunteer Opportunity Structure:**
- Categorical tags for filtering
- Time commitment and requirements fields
- Remote vs. in-person designation
- Skill and category arrays for matching

**Tracking & Reflection:**
- Volunteer hours include date, duration, activity title, and verification status
- Reflections contain title and content for journaling

**Design Rationale:** Flat, denormalized structures work well with in-memory storage and simplify AI prompt construction. Arrays enable flexible many-to-many relationships without complex joins.

## External Dependencies

### Third-Party Services

**OpenAI API**
- **Purpose:** AI-powered opportunity matching and recommendations
- **Model:** GPT-5 (configurable via `server/openai.ts`)
- **Authentication:** API key via `OPENAI_API_KEY` environment variable
- **Data Flow:** User profiles and opportunities sent to OpenAI → structured JSON recommendations returned

### Database

**Drizzle ORM**
- **Current Status:** Configured but not actively used
- **Dialect:** PostgreSQL (via `@neondatabase/serverless`)
- **Configuration:** `drizzle.config.ts` points to Neon serverless Postgres
- **Schema:** Defined in `shared/schema.ts` with `pgTable` definitions
- **Rationale for Inclusion:** Infrastructure is prepared for easy migration from in-memory to persistent storage. The schema definitions serve as type contracts even when using in-memory storage.

**Environment Variable Required:** `DATABASE_URL` (currently throws error if not set, but database is not used)

**Migration Path:** When ready to persist data:
1. Provision Postgres database (Neon or other provider)
2. Run `npm run db:push` to apply schema
3. Replace `MemStorage` with Drizzle-based implementation
4. Session storage can use `connect-pg-simple` (already installed)

### UI Component Libraries

**Radix UI Primitives**
- Comprehensive set of unstyled, accessible components
- Provides behavior and accessibility, styled via Tailwind

**shadcn/ui**
- Pre-styled components built on Radix UI
- Customizable via `components.json` configuration
- "New York" style variant selected

**Styling Stack:**
- Tailwind CSS for utility-first styling
- CSS variables for theme customization (light/dark modes)
- PostCSS for processing

### Build & Development Tools

**Vite**
- Fast development server with HMR
- Production build bundler for frontend
- Replit-specific plugins for enhanced development experience

**esbuild**
- Backend bundling for production builds
- Fast TypeScript compilation

**TypeScript**
- Full type safety across client and server
- Shared types via `@shared` path alias
- Strict mode enabled

### Form & Validation

**React Hook Form**
- Performant form state management
- Integrates with Zod via `@hookform/resolvers`

**Zod**
- Schema validation for forms and API inputs
- Type inference for TypeScript
- Used via `drizzle-zod` for database schema validation

### Utility Libraries

**date-fns:** Date formatting and manipulation
**clsx + tailwind-merge:** Conditional CSS class composition
**nanoid:** Unique ID generation for sessions and shares
**wouter:** Lightweight routing (~1.2kb)