# Design Guidelines: Volunteer Opportunity Matching Platform

## Design Approach

**Selected Approach:** Design System (Material Design inspired)
**Justification:** This is a productivity/educational tool for high school students requiring clear information hierarchy, efficient data display, and intuitive interaction patterns. Material Design's content-focused principles provide excellent readability while maintaining a modern, approachable aesthetic suitable for youth users.

**Key Design Principles:**
1. **Clarity First:** Information should be immediately scannable and actionable
2. **Youth-Appropriate Professionalism:** Clean and modern without being corporate or childish
3. **Efficiency:** Minimize clicks to key actions (search, filter, sign up for opportunities)
4. **Encouraging:** Design should motivate students to explore and engage with volunteer work

---

## Typography

**Font Families:**
- Primary: 'Inter' or 'Poppins' (modern, friendly, highly legible)
- Secondary/Accent: Same family in different weights

**Hierarchy:**
- Page Headings (H1): 2.5rem (40px), font-weight 700
- Section Headings (H2): 1.875rem (30px), font-weight 600
- Component Headings (H3): 1.25rem (20px), font-weight 600
- Body Text: 1rem (16px), font-weight 400
- Small Text/Labels: 0.875rem (14px), font-weight 500
- Buttons: 0.9375rem (15px), font-weight 600, uppercase tracking

**Line Heights:**
- Headings: 1.2
- Body: 1.6
- Buttons: 1.4

---

## Layout System

**Spacing Scale:** Use Tailwind units: **2, 4, 6, 8, 12, 16, 20, 24**
- Tight spacing: 2-4 (component internal padding)
- Standard spacing: 6-8 (between related elements)
- Section spacing: 12-16 (between different sections)
- Large spacing: 20-24 (major layout breaks)

**Grid System:**
- Max container width: `max-w-7xl` (1280px)
- Gutter spacing: 6-8
- Standard padding: px-6 md:px-8 lg:px-12

**Responsive Breakpoints:**
- Mobile: base (0-639px)
- Tablet: md (640px-1023px)
- Desktop: lg (1024px+)

---

## Component Library

### Navigation & Header

**Top Navigation Bar:**
- Height: 16 (64px)
- Sticky positioned with subtle shadow
- Left: Logo/App name (text or simple icon + text)
- Right: User profile with @username display and dropdown trigger
- Horizontal padding: 6-8

**Account Dropdown:**
- Positioned absolute from top-right
- Width: 48-56
- Padding: 2 vertical, items have py-3 px-4
- Options: "Account Info" and "Sign Out"
- Smooth slide-down animation
- Subtle shadow for depth

### Hero/Welcome Section

**Layout:**
- Not a traditional hero - compact greeting area
- Padding: py-12 md:py-16
- Centered content, max-w-4xl
- Greeting: "Hello, User!" (H1 size)
- Search bar immediately below

**Search Component:**
- Width: w-full max-w-2xl
- Height: 14 (56px)
- Rounded-lg border
- Large placeholder text: "What do you want to do today?"
- Search icon positioned left, padding-left to accommodate
- Clear/reset icon on right when text entered
- Focus state with subtle glow

### Main Content Area

**Two-Column Layout (Desktop):**
- Left Column (Main): flex-grow (roughly 70-75%)
- Right Column (Tools): w-80 (320px), sticky sidebar
- Gap between: 8
- Mobile: Stack vertically, tools below main content

### Opportunity Results Table

**Table Container:**
- Background: subtle surface elevation
- Border radius: rounded-lg
- Padding: 6
- Responsive: Converts to cards on mobile

**Table Structure:**
- Header row: font-weight 600, border-bottom with spacing pb-4 mb-4
- Columns: Volunteer (25%), Location (15%), Hosted By (15%), Requirements (20%), Description (25%)
- Row padding: py-4
- Hover state: subtle background change
- Dividers between rows

**Action Elements:**
- "View Details" or "Sign Up" button per row, aligned right
- Match score badge displayed prominently (percentage or stars)
- "Why this match" expandable tooltip/popover

### Tools Sidebar

**Container:**
- Background: distinct surface (card elevation)
- Padding: 6
- Rounded-lg
- Sticky top: 20 (accounts for navbar)

**Header:**
- "Tools" heading (H3)
- Margin-bottom: 6

**Tool Buttons:**
- Full width (w-full)
- Height: 12
- Margin-bottom: 3 between each
- Icon + text layout (icon left, text centered)
- Buttons: Quiz, Tracker, Reflections, Share, Help
- Each button distinct but cohesive

### Forms (Quiz, Login)

**Form Container:**
- Max-width: max-w-md for login, max-w-2xl for quiz
- Padding: 8
- Card elevation with rounded-lg

**Input Fields:**
- Height: 12
- Padding: px-4
- Rounded-md borders
- Label above input, margin-bottom: 2
- Focus states with outline
- Error states with border change and message below

**Quiz Specific:**
- Multi-step progress indicator at top
- Checkbox groups for interests (grid-cols-2 md:grid-cols-3)
- Radio buttons for single selections
- Slider for availability preferences
- "Next" and "Back" buttons, full-width on mobile, inline on desktop

### Dashboard/Tracking Components

**Hour Tracker:**
- Table or card-based entries
- Columns: Date, Activity, Hours, Verified status
- Add new entry button prominent
- Running total displayed in header

**Reflections:**
- Card-based entries with date stamps
- Text area for new entry: min-height 32
- Previous entries shown chronologically
- Character count indicator

**Filter Panel:**
- Accordion-style sections for each filter category
- Checkboxes for multi-select (Causes, Skills)
- Range slider for time commitment
- Distance selector with map integration option
- "Apply Filters" button sticky at bottom, "Clear All" link

### Buttons & Interactive Elements

**Primary Button:**
- Height: 12
- Padding: px-8
- Rounded-lg
- Font-weight: 600

**Secondary Button:**
- Same dimensions
- Border style instead of filled

**Icon Buttons:**
- Size: 10 or 12 depending on context
- Rounded-full
- Icon centered

**Links:**
- Underline on hover
- Font-weight: 500

### Cards

**Opportunity Cards (Mobile/Grid View):**
- Padding: 6
- Rounded-lg with shadow
- Image or icon at top (if applicable)
- Title (H3), host name (small text)
- Requirements and description truncated
- Match score badge top-right
- "View Details" button at bottom

**Stat Cards (Dashboard):**
- Padding: 6
- Centered content
- Large number display (2xl font size)
- Label below (text-sm)
- Icon or graphic element

### Modals & Overlays

**Modal Container:**
- Max-width: max-w-lg for simple, max-w-4xl for complex
- Padding: 8
- Centered on screen
- Overlay backdrop
- Close button top-right (size 6)

**Toast Notifications:**
- Fixed position top-right or bottom-right
- Width: 80-96
- Padding: 4
- Rounded-md
- Auto-dismiss after 5 seconds
- Success/error variants

---

## Images

**No Large Hero Image:** This is a productivity tool, not a marketing site. Focus on functional clarity.

**Supporting Images:**
- Opportunity thumbnails: Square or 16:9 ratio, size 20-24 (80-96px)
- Organization logos: Circular or square, size 10-12 (40-48px)
- Quiz illustration: Optional decorative image during quiz, max-w-md, centered
- Empty states: Simple illustration when no results found, max-w-xs

**Image Placement:**
- Opportunity cards: Top or left side
- Organization profile: Next to name in table/card
- Profile/account: Circular avatar, size 10

---

## Animations

**Minimal Animation Strategy:**
- Dropdown menus: Slide down with fade (150ms)
- Modal appearance: Fade + scale slightly (200ms)
- Button hovers: Subtle background transition (150ms)
- Loading states: Simple spinner or skeleton screens
- Page transitions: None or very subtle fade

**Avoid:**
- Scroll-triggered animations
- Complex parallax effects
- Distracting micro-interactions

---

## Accessibility

- Minimum touch target: 44x44px (size 11 in Tailwind)
- Form labels always present and associated
- Focus indicators on all interactive elements
- Proper heading hierarchy maintained
- Alt text for all images
- ARIA labels for icon-only buttons
- Keyboard navigation fully supported
- Sufficient contrast ratios maintained throughout

---

## Key Screen Specifications

**Login Page:** Centered card (max-w-md), logo above, form fields with labels, primary button full-width, minimal decoration

**Main Dashboard:** Greeting + search (centered, max-w-4xl) → Results table (left) + Tools sidebar (right, sticky) → Filters collapsible on mobile

**Quiz Flow:** Multi-step form, progress bar, one section per view, large checkboxes/options for easy selection, personality-driven friendly copy

**Opportunity Detail:** Modal or dedicated page, full information display, large "Sign Up" CTA, match explanation prominent, share functionality included