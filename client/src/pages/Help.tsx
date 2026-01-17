import { useLocation } from "wouter";
import { ArrowLeft, UserCircle, Building2, ClipboardList, Search, PenLine, Share2, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Help() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLocation("/dashboard")}
            data-testid="button-back-dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-page-title">Help & Tutorials</h1>
            <p className="text-muted-foreground">Learn how to use ServicePath</p>
          </div>
        </div>

        <Tabs defaultValue="students" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="students" className="gap-2" data-testid="tab-students">
              <UserCircle className="h-4 w-4" />
              For Students
            </TabsTrigger>
            <TabsTrigger value="organizations" className="gap-2" data-testid="tab-organizations">
              <Building2 className="h-4 w-4" />
              For Organizations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-6 mt-6">
            <Card data-testid="card-student-getting-started">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Getting Started
                </CardTitle>
                <CardDescription>Your first steps on ServicePath</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">1. Create Your Account</h4>
                  <p className="text-sm text-muted-foreground">
                    Sign up with a username and password. Choose "Student" as your account type. You'll be automatically logged in after registration.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">2. Take the Personality Quiz</h4>
                  <p className="text-sm text-muted-foreground">
                    Complete our quick quiz to tell us about your interests, skills, availability, and goals. This helps us match you with the best volunteer opportunities.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">3. Explore Opportunities</h4>
                  <p className="text-sm text-muted-foreground">
                    After completing the quiz, you'll see personalized recommendations. You can also browse by category or use the search feature to find specific opportunities.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-student-finding-opportunities">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  Finding Opportunities
                </CardTitle>
                <CardDescription>Discover volunteer activities that match your interests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Personalized Matches</h4>
                  <p className="text-sm text-muted-foreground">
                    After completing the quiz, your dashboard shows opportunities matched to your interests. Each match includes a score showing how well it fits your profile.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Browse by Category</h4>
                  <p className="text-sm text-muted-foreground">
                    Use the "Browse by Category" section to explore opportunities in specific areas like Environment, Education, Animal Welfare, Arts, Technology, Community Service, Senior Care, or Youth Mentoring.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Search</h4>
                  <p className="text-sm text-muted-foreground">
                    Use the search bar to find opportunities by keyword. Try searching for locations, skills, or specific types of activities.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-student-tracking-hours">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Tracking Your Hours
                </CardTitle>
                <CardDescription>Log and manage your volunteer service</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Log New Hours</h4>
                  <p className="text-sm text-muted-foreground">
                    Go to the Hour Tracker from the Tools sidebar. Enter the date, number of hours, and a description of your activity. You can also add a digital signature for verification.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">View Your Activity Log</h4>
                  <p className="text-sm text-muted-foreground">
                    All your logged hours appear in a table showing the date, hours, activity, and signature (if provided). Your total hours are displayed at the top.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Digital Signatures</h4>
                  <p className="text-sm text-muted-foreground">
                    Use your mouse or touch screen to sign the signature pad. This can serve as verification of your volunteer work. Signatures are optional but recommended.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-student-reflections">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PenLine className="h-5 w-5 text-primary" />
                  Writing Reflections
                </CardTitle>
                <CardDescription>Document your volunteer experiences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Why Write Reflections?</h4>
                  <p className="text-sm text-muted-foreground">
                    Reflections help you process your experiences and are valuable for college applications, scholarship essays, and personal growth.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Creating a Reflection</h4>
                  <p className="text-sm text-muted-foreground">
                    Go to the Reflections page from the Tools sidebar. Give your reflection a title and write about what you learned, challenges you faced, or how the experience impacted you.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-student-sharing">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-primary" />
                  Sharing Your Summary
                </CardTitle>
                <CardDescription>Share your volunteer journey with others</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Generate a Share Link</h4>
                  <p className="text-sm text-muted-foreground">
                    Go to the Share page from the Tools sidebar. Click "Generate Share Link" to create a unique URL that displays your volunteer summary.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">What's Included</h4>
                  <p className="text-sm text-muted-foreground">
                    Your shareable summary includes your total volunteer hours, number of activities, and reflection count. Share it with colleges, parents, or scholarship committees.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="organizations" className="space-y-6 mt-6">
            <Card data-testid="card-org-getting-started">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Getting Started
                </CardTitle>
                <CardDescription>Set up your organization on ServicePath</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">1. Create Your Account</h4>
                  <p className="text-sm text-muted-foreground">
                    Sign up and choose "Organization" as your account type. Provide your organization name, contact email, and a brief description of your mission.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">2. Access Your Dashboard</h4>
                  <p className="text-sm text-muted-foreground">
                    After logging in, you'll see your organization dashboard where you can manage opportunities and connect with student volunteers.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-org-managing-opportunities">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  Managing Opportunities
                </CardTitle>
                <CardDescription>Create and manage volunteer opportunities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Creating an Opportunity</h4>
                  <p className="text-sm text-muted-foreground">
                    Click "Create Opportunity" on your dashboard. Fill in the title, description, location, requirements, time commitment, and select relevant categories. You can also add optional event dates and times.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Choosing Categories</h4>
                  <p className="text-sm text-muted-foreground">
                    Select one or more categories that describe your opportunity: Environment, Education, Animals, Arts, Technology, Community, Seniors, or Youth. This helps students find your opportunity.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Editing Opportunities</h4>
                  <p className="text-sm text-muted-foreground">
                    Click the edit button on any opportunity to update its details. Changes are saved immediately and visible to students.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Deleting Opportunities</h4>
                  <p className="text-sm text-muted-foreground">
                    Click the delete button to remove an opportunity. This action cannot be undone, so make sure you want to permanently remove it.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-org-student-discovery">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  How Students Find You
                </CardTitle>
                <CardDescription>Understanding how your opportunities reach students</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Category Browsing</h4>
                  <p className="text-sm text-muted-foreground">
                    Students can browse opportunities by category. Make sure to select accurate categories so your opportunities appear in the right sections.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">AI-Powered Matching</h4>
                  <p className="text-sm text-muted-foreground">
                    When students complete the personality quiz, our AI matches them with relevant opportunities based on their interests, skills, and availability.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Search</h4>
                  <p className="text-sm text-muted-foreground">
                    Students can search by keyword. Include relevant terms in your title and description to improve discoverability.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-org-best-practices">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Best Practices
                </CardTitle>
                <CardDescription>Tips for attracting student volunteers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Write Clear Descriptions</h4>
                  <p className="text-sm text-muted-foreground">
                    Explain what volunteers will do, what they'll learn, and the impact they'll make. Students want to know their time will be meaningful.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Be Specific About Requirements</h4>
                  <p className="text-sm text-muted-foreground">
                    Clearly state age requirements, skills needed, and any training provided. This helps students determine if they're a good fit.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Keep Information Updated</h4>
                  <p className="text-sm text-muted-foreground">
                    Regularly review your opportunities to ensure dates, times, and details are current. Remove opportunities that are no longer available.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
