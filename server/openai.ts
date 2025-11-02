import OpenAI from "openai";
import type { UserProfile, VolunteerOpportunity, OpportunityMatch } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateRecommendations(
  profile: UserProfile,
  opportunities: VolunteerOpportunity[]
): Promise<OpportunityMatch[]> {
  try {
    const prompt = `You are an AI career and volunteer counselor helping high school students find meaningful volunteer opportunities.

Student Profile:
- Interests: ${profile.interests.join(", ")}
- Skills: ${profile.skills.join(", ")}
- Availability: ${profile.availability.join(", ")}
- Goals: ${profile.goals.join(", ")}
- Location Preference: ${profile.location}
${profile.serviceHoursGoal ? `- Service Hours Goal: ${profile.serviceHoursGoal} hours` : ""}

Volunteer Opportunities:
${opportunities.map((opp, i) => `${i + 1}. ${opp.title}
   - Organization: ${opp.hostedBy}
   - Location: ${opp.location} ${opp.remote ? "(Remote)" : "(In-person)"}
   - Categories: ${opp.category.join(", ")}
   - Required Skills: ${opp.skills.join(", ")}
   - Time Commitment: ${opp.timeCommitment}
   - Requirements: ${opp.requirements}
   - Description: ${opp.description}
   - Tags: ${opp.tags.join(", ")}
`).join("\n")}

For each opportunity, provide:
1. A match score from 0-100 based on how well it aligns with the student's interests, skills, availability, goals, and location preference
2. A brief, friendly explanation (2-3 sentences) of why this is a good match, highlighting specific connections to their profile

Return ONLY valid JSON in this exact format:
{
  "matches": [
    {
      "opportunityIndex": 0,
      "matchScore": 85,
      "matchReason": "This opportunity perfectly aligns with your interest in the environment and your Saturday morning availability. Your physical activity skills will be valuable for the hands-on restoration work, and it helps you achieve your service hours goal."
    }
  ]
}

Sort the matches by score (highest first). Be encouraging and specific in your explanations.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a helpful volunteer matching assistant. Always respond with valid JSON in the exact format requested.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 8192,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    if (!result.matches || !Array.isArray(result.matches)) {
      throw new Error("Invalid response format from AI");
    }

    const matches: OpportunityMatch[] = result.matches.map((match: any) => ({
      opportunity: opportunities[match.opportunityIndex],
      matchScore: Math.min(100, Math.max(0, match.matchScore)),
      matchReason: match.matchReason,
    })).filter((match: OpportunityMatch) => match.opportunity !== undefined);

    return matches;
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    // Fallback to simple keyword matching if AI fails
    return fallbackMatching(profile, opportunities);
  }
}

// Fallback matching algorithm if OpenAI API fails
function fallbackMatching(
  profile: UserProfile,
  opportunities: VolunteerOpportunity[]
): OpportunityMatch[] {
  return opportunities.map(opp => {
    let score = 0;
    const reasons: string[] = [];

    // Match interests
    const interestMatch = opp.category.some(cat => 
      profile.interests.includes(cat)
    );
    if (interestMatch) {
      score += 30;
      reasons.push("matches your interests");
    }

    // Match skills
    const skillMatch = opp.skills.some(skill =>
      profile.skills.includes(skill)
    );
    if (skillMatch) {
      score += 25;
      reasons.push("uses your skills");
    }

    // Match goals
    const goalMatch = opp.tags.some(tag =>
      profile.goals.includes(tag)
    );
    if (goalMatch) {
      score += 20;
      reasons.push("aligns with your goals");
    }

    // Location preference
    if (profile.location === "remote" && opp.remote) {
      score += 15;
      reasons.push("available remotely");
    } else if (profile.location !== "remote" && !opp.remote) {
      score += 10;
    }

    // Base score for all opportunities
    score += 10;

    const matchReason = reasons.length > 0
      ? `This opportunity ${reasons.join(", ")} and could be a great fit for your volunteer journey.`
      : "This opportunity could help you explore new areas of interest and develop new skills.";

    return {
      opportunity: opp,
      matchScore: Math.min(100, score),
      matchReason,
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}
