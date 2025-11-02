import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Share2, Copy, CheckCircle2, Download, Award, Clock } from "lucide-react";
import type { VolunteerHour, Reflection } from "@shared/schema";

interface ServiceSummary {
  totalHours: number;
  verifiedHours: number;
  activitiesCount: number;
  reflectionsCount: number;
  topActivities: string[];
}

export default function Share() {
  const [shareLink, setShareLink] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const { data: hours, isLoading: hoursLoading } = useQuery<VolunteerHour[]>({
    queryKey: ["/api/hours"],
  });

  const { data: reflections, isLoading: reflectionsLoading } = useQuery<Reflection[]>({
    queryKey: ["/api/reflections"],
  });

  const generateLinkMutation = useMutation({
    mutationFn: () => apiRequest<{ link: string }>("POST", "/api/share", {}),
    onSuccess: (data) => {
      setShareLink(data.link);
      toast({
        title: "Share link generated!",
        description: "Your service summary link is ready to share.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to generate link",
        description: error.message || "Please try again",
      });
    },
  });

  const summary: ServiceSummary = {
    totalHours: hours?.reduce((sum, h) => sum + h.hours, 0) || 0,
    verifiedHours: hours?.filter(h => h.verified).reduce((sum, h) => sum + h.hours, 0) || 0,
    activitiesCount: hours?.length || 0,
    reflectionsCount: reflections?.length || 0,
    topActivities: hours?.slice(0, 5).map(h => h.activityTitle) || [],
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Link copied to clipboard",
    });
  };

  const handleDownloadSummary = () => {
    const summaryText = `
VOLUNTEER SERVICE SUMMARY

Total Hours: ${summary.totalHours}
Verified Hours: ${summary.verifiedHours}
Activities: ${summary.activitiesCount}
Reflections: ${summary.reflectionsCount}

Recent Activities:
${summary.topActivities.map((activity, i) => `${i + 1}. ${activity}`).join('\n')}

Generated on ${new Date().toLocaleDateString()}
    `.trim();

    const blob = new Blob([summaryText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "volunteer-summary.txt";
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: "Summary has been downloaded",
    });
  };

  const isLoading = hoursLoading || reflectionsLoading;

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Share Your Service</h1>
          <p className="text-muted-foreground mt-1">
            Share your volunteer achievements for college applications or community recognition
          </p>
        </div>

        {/* Service Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Your Service Summary
            </CardTitle>
            <CardDescription>
              An overview of your volunteer contributions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-primary/5">
                    <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-3xl font-bold" data-testid="text-share-total-hours">
                      {summary.totalHours}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Hours</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-green-500/5">
                    <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto mb-2" />
                    <p className="text-3xl font-bold" data-testid="text-share-verified-hours">
                      {summary.verifiedHours}
                    </p>
                    <p className="text-sm text-muted-foreground">Verified</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-blue-500/5">
                    <svg className="h-6 w-6 text-blue-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-3xl font-bold" data-testid="text-share-activities">
                      {summary.activitiesCount}
                    </p>
                    <p className="text-sm text-muted-foreground">Activities</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-purple-500/5">
                    <svg className="h-6 w-6 text-purple-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <p className="text-3xl font-bold" data-testid="text-share-reflections">
                      {summary.reflectionsCount}
                    </p>
                    <p className="text-sm text-muted-foreground">Reflections</p>
                  </div>
                </div>

                {summary.topActivities.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Recent Activities</h3>
                    <ul className="space-y-2">
                      {summary.topActivities.map((activity, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm"
                          data-testid={`list-activity-${index}`}
                        >
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                            {index + 1}
                          </div>
                          {activity}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Share Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              Share Options
            </CardTitle>
            <CardDescription>
              Generate a shareable link or download your summary
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button
                onClick={() => generateLinkMutation.mutate()}
                disabled={generateLinkMutation.isPending || isLoading}
                className="w-full"
                data-testid="button-generate-link"
              >
                {generateLinkMutation.isPending ? "Generating..." : "Generate Shareable Link"}
              </Button>

              {shareLink && (
                <div className="flex gap-2">
                  <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm break-all">
                    {shareLink}
                  </div>
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    size="icon"
                    data-testid="button-copy-link"
                  >
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}

              <Button
                onClick={handleDownloadSummary}
                variant="outline"
                className="w-full"
                disabled={isLoading}
                data-testid="button-download-summary"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Text Summary
              </Button>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
              <p className="font-medium mb-2">💡 Tips for College Applications:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Use your reflections to write compelling essays</li>
                <li>Include verified hours in your activities section</li>
                <li>Download summaries for your counselor or recommenders</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
