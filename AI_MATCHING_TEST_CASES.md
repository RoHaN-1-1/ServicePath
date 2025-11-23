# Volunteer Matching AI - Test Cases

## Overview
This document contains test cases to validate the accuracy of the AI-powered volunteer opportunity matching system. Each test case includes a student profile (input) and expected matching results (output).

**Important Note on AI Variability**: These test cases use GPT-5, which is a stochastic (non-deterministic) model. Exact scores and phrasing will vary between runs. Focus on **relative rankings**, **score ranges (±15 points)**, and **qualitative assessment** rather than exact numbers.

## Scoring Guidelines
- **90-100**: Perfect match - Strong alignment across interests, skills, availability, goals, and location
- **75-89**: Excellent match - Strong alignment in most areas with minor gaps
- **60-74**: Good match - Solid alignment in several key areas
- **40-59**: Fair match - Some alignment but significant gaps
- **0-39**: Poor match - Minimal alignment with student profile

**Note**: These bands are guidelines. Due to AI variability, expect ±15 point variance.

---

## Test Case 1: Environmental Enthusiast

### Input Profile
```json
{
  "interests": ["environment"],
  "skills": ["physical"],
  "availability": ["saturday_morning"],
  "goals": ["make_impact", "service_hours"],
  "location": "10_miles",
  "serviceHoursGoal": 20
}
```

### Expected Top Matches

**Validation Focus**: These opportunities should rank in the **top 5** with **higher scores than poor matches**. Exact scores will vary.

#### 1. Riverside Park Cleanup (Likely High Scorer)
- **Why Expected**: Perfect alignment - Saturday morning availability, environment interest, physical skills
- **Match Reason Should Mention (at least 2 of)**:
  - Environment/nature interest alignment
  - Saturday morning availability
  - Physical/outdoor work skills
  - Making an impact or service hours goals

#### 2. Wildlife Habitat Restoration (Likely High Scorer)
- **Why Expected**: Strong alignment - Environment interest, physical work, Saturday availability
- **Match Reason Should Mention (at least 1 of)**:
  - Environment/nature connection
  - Physical outdoor work
  - Weekend availability

#### 3. Community Garden Assistant (Likely High Scorer)
- **Why Expected**: Good alignment - Environment interest, weekend availability, outdoor work
- **Match Reason Should Mention (at least 1 of)**:
  - Environment/sustainability theme
  - Weekend availability
  - Outdoor work

### Expected Poor Matches

**Validation Focus**: These should rank **significantly lower** (bottom third) than top matches.

#### Virtual Tutoring Buddies (Likely Low Scorer)
- **Why Expected**: Major misalignment - Weekday availability, virtual setting, no environment focus
- **Match Reason**: May be generic or focus on general skill development

---

## Test Case 2: Tech-Savvy Remote Learner

### Input Profile
```json
{
  "interests": ["technology", "tutoring"],
  "skills": ["tech", "tutoring"],
  "availability": ["weekday_afternoon", "flexible"],
  "goals": ["career_exploration", "learn_skills"],
  "location": "remote",
  "serviceHoursGoal": 15
}
```

### Expected Top Matches

#### 1. Coding for Kids Club (Likely Top Match)
- **Why Expected**: Perfect alignment - Tech/tutoring interests, weekday afternoon, STEM career exploration
- **Match Reason Should Mention (at least 2 of)**:
  - Technology/STEM interest
  - Tutoring interest or skills
  - Weekday/flexible availability
  - Career exploration goal
  - Virtual option

#### 2. Virtual Tutoring Buddies (Likely High Scorer)
- **Why Expected**: Excellent match - Remote setup, tutoring focus, weekday availability
- **Match Reason Should Mention (at least 2 of)**:
  - Remote/virtual nature
  - Tutoring alignment
  - Weekday availability

#### 3. Homework Help Hotline (Likely High Scorer)
- **Why Expected**: Strong match - Virtual, tutoring, weekday afternoons
- **Match Reason Should Mention (at least 1 of)**:
  - Remote participation
  - Teaching/tutoring
  - Weekday schedule

### Expected Poor Matches

#### Riverside Park Cleanup (Likely Low Scorer)
- **Why Expected**: Major misalignment - In-person only, Saturday morning, physical work vs. remote tech preference

---

## Test Case 3: Social Media Creator for Animals

### Input Profile
```json
{
  "interests": ["animals"],
  "skills": ["social_media", "creative"],
  "availability": ["flexible"],
  "goals": ["make_impact", "learn_skills"],
  "location": "hybrid"
}
```

### Expected Top Matches

#### 1. Animal Shelter Media Team (Likely Top Match)
- **Why Expected**: Perfect match - Animal welfare, social media skills, creative work, flexible schedule, hybrid option
- **Match Reason Should Mention (at least 2 of)**:
  - Animal welfare interest
  - Social media and creative skills alignment
  - Flexible availability
  - Hybrid/remote option

#### 2. Animal Therapy Visits (Likely Good Match)
- **Why Expected**: Good match - Animal interest, weekend availability overlap
- **Match Reason Should Mention (at least 1 of)**:
  - Animal welfare connection
  - Making an impact goal

### Expected Fair Matches

#### EcoTech Recycling Drive (Likely Fair Match)
- **Why Expected**: Fair match - Social media component, hybrid option, but not animal-focused
- **Match Reason Should Mention (at least 1 of)**:
  - Social media outreach skills
  - Hybrid participation option

---

## Test Case 4: Arts & Leadership Student

### Input Profile
```json
{
  "interests": ["arts", "youth"],
  "skills": ["creative", "leadership", "communication"],
  "availability": ["saturday_afternoon", "sunday_afternoon"],
  "goals": ["leadership", "college_application", "meet_people"],
  "location": "10_miles",
  "serviceHoursGoal": 25
}
```

### Expected Top Matches

#### 1. Youth Leadership Workshop (Likely Top Match)
- **Why Expected**: Excellent alignment - Youth mentoring, leadership skills, weekend availability, leadership goals
- **Match Reason Should Mention (at least 2 of)**:
  - Leadership skill and goal alignment
  - Youth mentoring interest
  - Weekend availability match
  - College application strengthening

#### 2. Community Art Mural Project (Likely High Scorer)
- **Why Expected**: Excellent match - Arts interest, creative skills, weekend availability, teamwork
- **Match Reason Should Mention (at least 2 of)**:
  - Arts and culture interest
  - Creative/artistic skills
  - Weekend (Saturday/Sunday) availability
  - Teamwork and meeting people

#### 3. Arts for All Youth Program (Likely High Scorer)
- **Why Expected**: Strong match - Arts and youth interests, creative skills
- **Match Reason Should Mention (at least 1 of)**:
  - Arts interest alignment
  - Working with youth
  - Creative skills utilization

---

## Test Case 5: Senior Care Volunteer (Minimal Profile)

### Input Profile
```json
{
  "interests": ["seniors"],
  "skills": ["communication"],
  "availability": ["weekday_afternoon"],
  "goals": ["make_impact"],
  "location": "5_miles"
}
```

### Expected Top Matches

#### 1. Senior Tech Helpers (Likely High Scorer)
- **Why Expected**: Good alignment - Senior care interest, communication skills, weekday availability
- **Match Reason Should Mention (at least 2 of)**:
  - Senior care interest
  - Communication/patience skills
  - Weekday availability connection

#### 2. Senior Story Recording Project (Likely Good Match)
- **Why Expected**: Good match - Senior focus, communication/listening skills, Friday availability
- **Match Reason Should Mention (at least 1 of)**:
  - Senior care interest
  - Communication/listening skills
  - Making an impact through preserving stories

---

## Test Case 6: Overwhelmed Multi-Interest Student

### Input Profile
```json
{
  "interests": ["environment", "animals", "arts", "community", "technology"],
  "skills": ["social_media", "creative", "tech", "physical", "leadership"],
  "availability": ["saturday_morning", "saturday_afternoon", "sunday_morning", "sunday_afternoon", "flexible"],
  "goals": ["leadership", "service_hours", "college_application", "make_impact", "learn_skills"],
  "location": "hybrid",
  "serviceHoursGoal": 50
}
```

### Expected Behavior
- **All opportunities should score above 50** (at least some alignment)
- **Multiple 80+ scores expected** due to broad interests and availability
- **Match reasons should be specific** (not generic) and reference profile details
- **Top matches should still show clear differentiation** in scores

### Expected Top Matches (Examples)

#### High Scorers (85-95 range expected)
- Community Art Mural Project (arts, creative, leadership, weekend)
- Animal Shelter Media Team (animals, social media, creative, flexible)
- EcoTech Recycling Drive (environment, tech, social media, hybrid)
- Youth Leadership Workshop (leadership, weekend, college goals)

---

## Test Case 7: Restricted Availability Student

### Input Profile
```json
{
  "interests": ["tutoring"],
  "skills": ["tutoring"],
  "availability": ["weekday_morning"],
  "goals": ["service_hours"],
  "location": "remote"
}
```

### Expected Behavior
- **Most opportunities should score low** (30-50 range) due to weekday morning restriction
- **Very few perfect matches** available
- **Match reasons should acknowledge availability constraints**

### Expected Matches
- Most education/tutoring opportunities require weekday afternoon/evening or weekends
- Should still receive recommendations with explanations like:
  - "While this opportunity typically runs after school, you might be able to arrange morning sessions"
  - "Consider adjusting your schedule to participate in this excellent tutoring opportunity"

---

## Test Case 8: Location Mismatch - Remote Only

### Input Profile
```json
{
  "interests": ["community"],
  "skills": ["physical", "leadership"],
  "availability": ["saturday_morning", "sunday_morning"],
  "goals": ["make_impact"],
  "location": "remote"
}
```

### Expected Behavior
- **In-person community service opportunities should score lower** (40-60 range)
- **Remote/hybrid opportunities should score higher** even if not perfect interest match
- **Match reasons should acknowledge location preference**

### Expected Top Matches

#### EcoTech Recycling Drive (Should Score Higher)
- **Why Expected**: Hybrid option available, weekend flexibility
- **Match Reason Should Mention**: Remote/hybrid participation option

#### Virtual options should rank higher than purely in-person options
- Virtual Tutoring Buddies, Homework Help Hotline should rank higher (even without perfect interest match)

---

## Test Case 9: Edge Case - No Service Hours Goal

### Input Profile
```json
{
  "interests": ["technology"],
  "skills": ["tech"],
  "availability": ["flexible"],
  "goals": ["career_exploration"],
  "location": "hybrid",
  "serviceHoursGoal": null
}
```

### Expected Behavior
- **Should still provide quality matches**
- **Match reasons should focus on career exploration**
- **Should not reference service hours goals in explanations**

### Expected Top Matches

#### STEM Mentorship Program (Likely High Scorer)
- **Match Reason Should Mention (at least 2 of)**:
  - Technology/STEM interest
  - Career exploration in tech field
  - Flexible scheduling
  - Should NOT mention service hours

---

## Test Case 10: Fallback Algorithm Test (Deterministic)

### Purpose
Test the fallback matching algorithm when OpenAI API is unavailable. **Unlike AI tests, fallback results are deterministic.**

### Input Profile
```json
{
  "interests": ["environment"],
  "skills": ["physical"],
  "availability": ["saturday_morning"],
  "goals": ["service_hours"],
  "location": "10_miles"
}
```

### Fallback Algorithm Scoring Formula
- +30 points for interest match (category includes student interest)
- +25 points for skill match (required skills includes student skill)
- +20 points for goal match (tags include student goal)
- +15 points for remote location match (both remote)
- +10 points for in-person match when student prefers in-person
- +10 base score (all opportunities)

### Expected Top Fallback Matches

#### Riverside Park Cleanup (Expected Score: 75 exactly)
- Interest match (+30): "Environment & Nature" category
- Skill match (+25): Physical outdoor work
- Location match (+10): In-person
- Base (+10)
- **Total: 75**

#### Match Reason Format (Deterministic):
Fallback reasons follow a template pattern:
- If matches found: "This opportunity [matches your interests], [uses your skills], [aligns with your goals], [available remotely/locally] and could be a great fit for your volunteer journey."
- If no matches: "This opportunity could help you explore new areas of interest and develop new skills."

**Validation**: Fallback scores should be consistent across runs with identical inputs.

---

## Quality Criteria for All Test Cases

### Match Scores Must:
1. ✅ Range from 0-100 (no scores outside this range)
2. ✅ Be sorted in descending order (highest first)
3. ✅ Reflect actual alignment (better matches score higher than poor matches)
4. ✅ Show differentiation (score spread across the range, not clustered)

### Match Reasons Must (AI Mode):
1. ✅ Be personalized to the student profile (not copy-paste generic text)
2. ✅ Mention **at least 1-2 relevant profile elements** (interests, skills, goals, availability, or location)
3. ✅ Explain WHY it's a match (not just what the opportunity is)
4. ✅ Be encouraging and student-friendly in tone
5. ✅ Be approximately 2-3 sentences (exact length may vary)

**Example of Good Reason**:
> "This opportunity perfectly aligns with your passion for environmental conservation and your Saturday morning availability. Your skills in outdoor physical work will be valuable for the hands-on restoration projects, and it's a great way to achieve your service hours goal while making a real impact."

**Example of Poor Reason** (too generic):
> "This is a volunteer opportunity that could help you develop new skills and meet people."

### Match Reasons Format (Fallback Mode):
- Follow template pattern: "This opportunity [list matches] and could be a great fit for your volunteer journey."
- Deterministic based on matches found

### Edge Cases to Validate:
1. ✅ Empty profile fields (should still return results)
2. ✅ Conflicting preferences (remote location but in-person-only interests)
3. ✅ Very broad profiles (all interests selected)
4. ✅ Very narrow profiles (single interest/skill)
5. ✅ Unusual availability (only weekday mornings)
6. ✅ Missing optional fields (no serviceHoursGoal)

---

## Testing Process

### For Each Test Case:
1. **Submit the input profile** to the `generateRecommendations` function
2. **Verify match scores** fall within expected ranges
3. **Check match reasons** for specificity and accuracy
4. **Confirm sorting** (highest scores first)
5. **Validate JSON structure** matches `OpportunityMatch[]` schema

### Success Criteria:

**For AI-Powered Matches (GPT-5)**:
- Top expected matches appear in **top 5-7 results** (exact order may vary)
- Score differences reflect alignment quality (better matches score higher)
- Match reasons are **specific and personalized** (not generic)
- Reasons mention **at least 1-2 relevant profile details**
- No technical errors or invalid JSON responses
- Scores fall within ±15 points of suggested ranges (due to AI variability)

**For Fallback Algorithm**:
- Scores are **deterministic** (same input = same output)
- Scores exactly match calculated formula
- Reasons follow template patterns consistently
- Top matches determined by point accumulation

---

## Notes for Testers

### AI Variability (Critical):
GPT-5 is a **stochastic model** - outputs vary between runs even with identical inputs. This is expected behavior, not a bug.

**What to Validate**:
- ✅ **Relative rankings**: Top expected matches rank higher than poor matches
- ✅ **Score distribution**: Good matches score 70+, poor matches score below 50
- ✅ **Reason quality**: Mentions specific profile details (not just generic encouragement)
- ✅ **Consistency of direction**: Same profile tested 3 times should rank top opportunities similarly

**What NOT to Expect**:
- ❌ Exact score matches (e.g., expecting exactly 87 every time)
- ❌ Identical phrasing in match reasons
- ❌ Same top 3 in exact order every run
- ❌ Scores within narrow bands (±5 points is too strict)

**Acceptable Variance**: ±15 points on any given score, top opportunities may shift positions but should stay in top tier

### Fallback Testing:
To test the fallback algorithm:
1. Temporarily disable OpenAI API key or simulate API failure
2. Verify fallback algorithm activates
3. Confirm scores follow deterministic formula
4. Check that match reasons use fallback templates

### Continuous Improvement:
Track and document cases where AI matching produces:
- Unexpected low scores for seemingly good matches
- Generic reasons when specific details are available
- Scores that don't reflect actual alignment
- Inconsistent ranking across similar profiles

---

## How to Run Tests

### Manual Testing:
1. Complete the onboarding quiz with one of the test profiles above
2. Navigate to the dashboard
3. Review the recommended opportunities
4. Verify scores and match reasons align with expectations

### API Testing:
```javascript
// Example test call
const profile = {
  interests: ["environment"],
  skills: ["physical"],
  availability: ["saturday_morning"],
  goals: ["make_impact", "service_hours"],
  location: "10_miles",
  serviceHoursGoal: 20
};

const opportunities = await storage.getOpportunities();
const matches = await generateRecommendations(profile, opportunities);

console.log(matches);
// Verify top match is Riverside Park Cleanup with score 85-95
```

### Automated Testing Script:
Consider creating a test script that:
1. Loads all test case profiles
2. Runs matching for each profile
3. Compares results against expected ranges
4. Generates a test report with pass/fail status
5. Flags outliers for manual review

---

## Future Enhancements

### Additional Test Cases to Consider:
- Students with disabilities (accessibility requirements)
- Transportation constraints (no car, public transit only)
- Language preferences (bilingual opportunities)
- Age-specific restrictions (14 vs 15+ opportunities)
- Seasonal availability (summer only, school year only)
- Group volunteering preferences (wants to go with friends)

### Metrics to Track:
- Average match score across all profiles
- Score distribution (how many 90+, 70-89, etc.)
- Reason quality scores (manual review)
- User satisfaction correlation (if user feedback available)
- Fallback usage rate (how often AI fails)
