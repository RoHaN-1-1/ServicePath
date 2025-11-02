import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Calendar, Users, BookOpen, Share2, HelpCircle, Sparkles, MapPin, Clock, Building2, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { OpportunityMatch, UserProfile } from "@shared/schema";
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

  const { data: recommendations, isLoading: recsLoading } = useQuery<OpportunityMatch[]>({
    queryKey: ["/api/recommend"],
    enabled: !!profile,
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
            {profileLoading || recsLoading ? (
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
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold">Your Personalized Matches</h2>
                    <p className="text-muted-foreground">
                      AI-powered recommendations based on your interests and goals
                    </p>
                  </div>
                </div>

                {recommendations && recommendations.length > 0 ? (
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[25%]">Volunteer Opportunity</TableHead>
                          <TableHead className="w-[15%]">Location</TableHead>
                          <TableHead className="w-[15%]">Hosted By</TableHead>
                          <TableHead className="w-[20%]">Requirements</TableHead>
                          <TableHead className="w-[25%]">Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recommendations.map((match) => (
                          <TableRow
                            key={match.opportunity.id}
                            className="hover-elevate cursor-pointer"
                            data-testid={`row-opportunity-${match.opportunity.id}`}
                          >
                            <TableCell className="font-medium">
                              <div className="space-y-2">
                                <div className="font-semibold">{match.opportunity.title}</div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Badge
                                          className={`${getScoreColor(match.matchScore)} text-white`}
                                          data-testid={`badge-score-${match.opportunity.id}`}
                                        >
                                          {match.matchScore}% Match
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-sm">
                                        <p className="font-semibold mb-1">Why this match?</p>
                                        <p className="text-sm">{match.matchReason}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  {match.opportunity.remote && (
                                    <Badge variant="secondary">Remote</Badge>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                {match.opportunity.location}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                {match.opportunity.hostedBy}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                {match.opportunity.requirements}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {match.opportunity.description}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                      <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium">No recommendations yet</p>
                      <p className="text-muted-foreground">
                        Try searching for opportunities or update your profile
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Tools Sidebar */}
          <aside className="lg:w-80 space-y-6">
            <Card className="sticky top-20">
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
                  className="w-full justify-start gap-3 h-12"
                  data-testid="button-tool-help"
                >
                  <HelpCircle className="h-5 w-5" />
                  Help
                </Button>
              </CardContent>
            </Card>

            {profile && (
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
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
