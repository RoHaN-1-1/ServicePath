import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Calendar, Users, BookOpen, Share2, HelpCircle, Sparkles, MapPin, Clock, Building2, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { OpportunityMatch, UserProfile, VolunteerOpportunity } from "@shared/schema";
import { useLocation } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
  });

  const { data: allOpportunities } = useQuery<VolunteerOpportunity[]>({
    queryKey: ["/api/opportunities"],
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-gray-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Fair Match";
    return "Possible Match";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Welcome Section */}
            <div className="text-center lg:text-left space-y-4">
              <h1 className="text-4xl font-bold" data-testid="text-greeting">
                Hello, {profileLoading ? "..." : profile ? "Student" : "User"}!
              </h1>
              <div className="max-w-2xl mx-auto lg:mx-0">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="What do you want to do today?"
                    className="pl-12 pr-4 h-14 text-base"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    data-testid="input-search"
                  />
                </div>
              </div>
            </div>

            {/* Recommendations Section */}
            {profileLoading ? (
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-96" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </CardContent>
              </Card>
            ) : !profile ? (
              allOpportunities && allOpportunities.length > 0 ? (
                <div className="space-y-6">
                  <Card>
                    <CardHeader className="text-center">
                      <div className="flex justify-center mb-4">
                        <Sparkles className="h-12 w-12 text-primary" />
                      </div>
                      <CardTitle>Discover Volunteer Opportunities</CardTitle>
                      <CardDescription>
                        Take our quick quiz to get personalized recommendations, or browse opportunities by category below
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                      <Button onClick={() => setLocation("/quiz")} size="lg" data-testid="button-start-quiz">
                        Take Quiz for Personalized Matches
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Opportunities by category */}
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold">Browse by Category</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { name: "Environment & Nature", slug: "environment", categories: ["environment"], icon: "🌿" },
                        { name: "Education & Training", slug: "education", categories: ["tutoring", "youth"], icon: "📚" },
                        { name: "Animal Welfare", slug: "animals", categories: ["animals"], icon: "🐾" },
                        { name: "Arts & Culture", slug: "arts", categories: ["arts"], icon: "🎨" },
                        { name: "Technology & STEM", slug: "technology", categories: ["technology"], icon: "💻" },
                        { name: "Community Service", slug: "community", categories: ["community"], icon: "🤝" },
                        { name: "Senior Care", slug: "seniors", categories: ["seniors"], icon: "👴" },
                        { name: "Youth Mentoring", slug: "youth", categories: ["youth"], icon: "👦" },
                      ].map(({ name, slug, categories }) => {
                        const categoryOpps = allOpportunities.filter(opp =>
                          opp.category.some(cat => categories.includes(cat))
                        );
                        
                        return (
                          <Card 
                            key={name} 
                            className="cursor-pointer hover-elevate"
                            onClick={() => setLocation(`/search?category=${slug}`)}
                            data-testid={`card-category-${slug}`}
                          >
                            <CardContent className="pt-6">
                              <div className="text-center">
                                <h3 className="font-semibold text-sm mb-2">{name}</h3>
                                <Badge variant="secondary">
                                  {categoryOpps.length} {categoryOpps.length === 1 ? "opportunity" : "opportunities"}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      <Sparkles className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <CardTitle>Take the Quiz to Get Started</CardTitle>
                    <CardDescription>
                      Complete our quick personality quiz to receive personalized volunteer recommendations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <Button onClick={() => setLocation("/quiz")} size="lg" data-testid="button-start-quiz">
                      Start Quiz
                    </Button>
                  </CardContent>
                </Card>
              )
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold">Opportunities for You</h2>
                    <p className="text-muted-foreground">
                      Based on your selected interests: {profile.interests.join(", ")}
                    </p>
                  </div>
                </div>

                {(() => {
                  // Map user interests to opportunity categories
                  const interestToCategoryMap: Record<string, string[]> = {
                    "environment": ["environment"],
                    "education": ["tutoring", "youth"],
                    "animals": ["animals"],
                    "arts": ["arts"],
                    "technology": ["technology"],
                    "community": ["community"],
                    "seniors": ["seniors"],
                    "youth": ["youth"],
                  };

                  // Get all categories that match user's interests
                  const relevantCategories = profile.interests.flatMap(
                    interest => interestToCategoryMap[interest] || []
                  );

                  // Filter opportunities by user's interests
                  const matchedOpportunities = allOpportunities?.filter(opp =>
                    opp.category.some(cat => relevantCategories.includes(cat))
                  ) || [];

                  return matchedOpportunities.length > 0 ? (
                    <div className="grid gap-4">
                      {matchedOpportunities.map(opp => (
                        <Card key={opp.id} className="hover-elevate" data-testid={`card-opportunity-${opp.id}`}>
                          <CardHeader>
                            <CardTitle className="flex items-start justify-between gap-4">
                              <span>{opp.title}</span>
                              {opp.remote && <Badge variant="secondary">Remote</Badge>}
                            </CardTitle>
                            <CardDescription>{opp.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid gap-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Hosted by:</span>
                                <span className="font-medium">{opp.hostedBy}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Location:</span>
                                <span className="font-medium">{opp.location}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Time:</span>
                                <span className="font-medium">{opp.timeCommitment}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Requirements:</span>
                                <span className="font-medium">{opp.requirements}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2">
                              {opp.category.map(cat => (
                                <Badge key={cat} variant="outline" className="text-xs">
                                  {cat}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="border-dashed">
                      <CardContent className="py-12 text-center">
                        <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-lg font-medium">No matching opportunities found</p>
                        <p className="text-muted-foreground">
                          Try updating your interests in the quiz or browse all opportunities
                        </p>
                      </CardContent>
                    </Card>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Tools Sidebar */}
          <aside className="lg:w-80 space-y-6">
            <div className="lg:sticky lg:top-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tools</CardTitle>
                <CardDescription>Manage your volunteer journey</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => setLocation("/quiz")}
                  data-testid="button-tool-quiz"
                >
                  <Sparkles className="h-5 w-5" />
                  {profile ? "Retake Quiz" : "Take Quiz"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => setLocation("/tracker")}
                  data-testid="button-tool-tracker"
                >
                  <Calendar className="h-5 w-5" />
                  Hour Tracker
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => setLocation("/reflections")}
                  data-testid="button-tool-reflections"
                >
                  <BookOpen className="h-5 w-5" />
                  Reflections
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => setLocation("/share")}
                  data-testid="button-tool-share"
                >
                  <Share2 className="h-5 w-5" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={() => setLocation("/help")}
                  data-testid="button-student-help"
                >
                  <HelpCircle className="h-5 w-5" />
                  Help
                </Button>
              </CardContent>
            </Card>

            {profile && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Your Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Interests</p>
                      <div className="flex flex-wrap gap-1">
                        {profile.interests.slice(0, 3).map(interest => (
                          <Badge key={interest} variant="secondary" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                        {profile.interests.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{profile.interests.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    {profile.serviceHoursGoal && (
                      <div>
                        <p className="text-muted-foreground mb-1">Service Goal</p>
                        <p className="font-medium">{profile.serviceHoursGoal} hours</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Browse by Category - shown after quiz completion */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Browse by Category</CardTitle>
                    <CardDescription>Explore all opportunity types</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      { name: "Environment & Nature", slug: "environment", categories: ["environment"] },
                      { name: "Education & Training", slug: "education", categories: ["tutoring", "youth"] },
                      { name: "Animal Welfare", slug: "animals", categories: ["animals"] },
                      { name: "Arts & Culture", slug: "arts", categories: ["arts"] },
                      { name: "Technology & STEM", slug: "technology", categories: ["technology"] },
                      { name: "Community Service", slug: "community", categories: ["community"] },
                      { name: "Senior Care", slug: "seniors", categories: ["seniors"] },
                      { name: "Youth Mentoring", slug: "youth", categories: ["youth"] },
                    ].map(({ name, slug, categories }) => {
                      const categoryOpps = allOpportunities?.filter(opp =>
                        opp.category.some(cat => categories.includes(cat))
                      ) || [];

                      return (
                        <Button
                          key={name}
                          variant="ghost"
                          className="w-full justify-between gap-2 h-auto py-3 px-3"
                          onClick={() => setLocation(`/search?category=${slug}`)}
                          data-testid={`button-sidebar-category-${slug}`}
                        >
                          <span className="text-sm font-medium">{name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {categoryOpps.length}
                          </Badge>
                        </Button>
                      );
                    })}
                  </CardContent>
                </Card>
              </>
            )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
