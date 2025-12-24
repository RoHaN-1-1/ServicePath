import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search as SearchIcon, MapPin, Building2, FileText, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { VolunteerOpportunity } from "@shared/schema";

const CATEGORY_MAP: Record<string, { name: string; categories: string[] }> = {
  environment: { name: "Environment & Nature", categories: ["environment"] },
  education: { name: "Education & Training", categories: ["tutoring", "youth"] },
  animals: { name: "Animal Welfare", categories: ["animals"] },
  arts: { name: "Arts & Culture", categories: ["arts"] },
  technology: { name: "Technology & STEM", categories: ["technology"] },
  community: { name: "Community Service", categories: ["community"] },
  seniors: { name: "Senior Care", categories: ["seniors"] },
  youth: { name: "Youth Mentoring", categories: ["youth"] },
};

export default function Search() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  const initialQuery = searchParams.get("q") || "";
  const categorySlug = searchParams.get("category") || "";
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);

  // For text search
  const { data: searchResults, isLoading: searchLoading } = useQuery<VolunteerOpportunity[]>({
    queryKey: ["/api/search", activeQuery],
    enabled: activeQuery.length > 0 && !categorySlug,
  });

  // For category browsing - fetch all opportunities
  const { data: allOpportunities, isLoading: allLoading } = useQuery<VolunteerOpportunity[]>({
    queryKey: ["/api/opportunities"],
    enabled: !!categorySlug,
  });

  // Filter by category if browsing by category
  const categoryInfo = categorySlug ? CATEGORY_MAP[categorySlug] : null;
  const categoryOpportunities = categorySlug && allOpportunities
    ? allOpportunities.filter(opp => 
        opp.category.some(cat => categoryInfo?.categories.includes(cat))
      )
    : [];

  const opportunities = categorySlug ? categoryOpportunities : searchResults;
  const isLoading = categorySlug ? allLoading : searchLoading;

  useEffect(() => {
    setSearchQuery(initialQuery);
    setActiveQuery(initialQuery);
  }, [initialQuery]);

  const handleSearch = () => {
    setActiveQuery(searchQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            {categoryInfo ? categoryInfo.name : "Search Opportunities"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {categoryInfo 
              ? `${categoryOpportunities.length} opportunities in this category`
              : "Find volunteer opportunities that match your interests"}
          </p>
          {categoryInfo && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3"
              onClick={() => setLocation("/")}
              data-testid="button-back-to-browse"
            >
              Back to Browse
            </Button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for opportunities (e.g., environment, tutoring, animals)..."
            className="pl-12 pr-4 h-14 text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            data-testid="input-search-query"
          />
          <Button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            data-testid="button-search"
          >
            Search
          </Button>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : (activeQuery || categorySlug) && opportunities ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                Found {opportunities.length} {opportunities.length === 1 ? "opportunity" : "opportunities"}
              </p>
            </div>

            {opportunities.length > 0 ? (
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
                    {opportunities.map((opp) => (
                      <TableRow
                        key={opp.id}
                        className="hover-elevate cursor-pointer"
                        data-testid={`row-search-result-${opp.id}`}
                      >
                        <TableCell className="font-medium">
                          <div className="space-y-2">
                            <div className="font-semibold">{opp.title}</div>
                            <div className="flex items-center gap-2 flex-wrap">
                              {opp.remote && (
                                <Badge variant="secondary">Remote</Badge>
                              )}
                              {opp.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag.replace(/_/g, " ")}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {opp.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            {opp.hostedBy}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            {opp.requirements}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {opp.description}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">No results found</p>
                  <p className="text-muted-foreground">
                    Try different keywords or check your spelling
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">Start your search</p>
              <p className="text-muted-foreground">
                Enter keywords like "environment", "tutoring", or "animals" to find opportunities
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
