import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserProfileSchema, type InsertUserProfile } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, ArrowRight, Loader2, Heart, Sparkles, Target, MapPin } from "lucide-react";
import { useLocation } from "wouter";

const INTERESTS_OPTIONS = [
  { value: "environment", label: "Environment & Nature" },
  { value: "animals", label: "Animal Welfare" },
  { value: "arts", label: "Arts & Culture" },
  { value: "tutoring", label: "Education & Tutoring" },
  { value: "youth", label: "Youth Mentoring" },
  { value: "seniors", label: "Senior Care" },
  { value: "community", label: "Community Service" },
  { value: "technology", label: "Technology & STEM" },
];

const SKILLS_OPTIONS = [
  { value: "social_media", label: "Social Media & Content Creation" },
  { value: "tutoring", label: "Tutoring & Teaching" },
  { value: "event_planning", label: "Event Planning" },
  { value: "physical", label: "Physical/Outdoor Activities" },
  { value: "creative", label: "Creative/Artistic Skills" },
  { value: "tech", label: "Technology/Computer Skills" },
  { value: "communication", label: "Public Speaking & Communication" },
  { value: "leadership", label: "Leadership & Team Management" },
];

const AVAILABILITY_OPTIONS = [
  { value: "saturday_morning", label: "Saturday Morning" },
  { value: "saturday_afternoon", label: "Saturday Afternoon" },
  { value: "sunday_morning", label: "Sunday Morning" },
  { value: "sunday_afternoon", label: "Sunday Afternoon" },
  { value: "weekday_morning", label: "Weekday Morning (before school)" },
  { value: "weekday_afternoon", label: "Weekday Afternoon (after school)" },
  { value: "weekday_evening", label: "Weekday Evening" },
  { value: "flexible", label: "Flexible/Variable" },
];

const GOALS_OPTIONS = [
  { value: "leadership", label: "Build Leadership Skills" },
  { value: "service_hours", label: "Complete Service Hours" },
  { value: "college_application", label: "Strengthen College Applications" },
  { value: "career_exploration", label: "Explore Career Interests" },
  { value: "make_impact", label: "Make a Meaningful Impact" },
  { value: "meet_people", label: "Meet Like-Minded People" },
  { value: "learn_skills", label: "Learn New Skills" },
];

const LOCATION_OPTIONS = [
  { value: "5_miles", label: "Within 5 miles" },
  { value: "10_miles", label: "Within 10 miles" },
  { value: "20_miles", label: "Within 20 miles" },
  { value: "remote", label: "Remote/Virtual Only" },
  { value: "hybrid", label: "Hybrid (Remote + In-Person)" },
];

export default function Quiz() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [formData, setFormData] = useState({
    interests: [] as string[],
    skills: [] as string[],
    availability: [] as string[],
    goals: [] as string[],
    location: "",
    serviceHoursGoal: undefined as number | undefined,
  });

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const toggleArrayValue = (field: keyof typeof formData, value: string) => {
    const currentArray = formData[field] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(v => v !== value)
      : [...currentArray, value];
    setFormData({ ...formData, [field]: newArray });
  };

  const handleSubmit = async () => {
    try {
      insertUserProfileSchema.parse(formData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Please complete all required fields",
        description: "Make sure you've selected at least one option in each section.",
      });
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/profile", formData);
      await queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Profile created!",
        description: "Finding your perfect volunteer matches...",
      });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to save profile",
        description: error.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return formData.interests.length > 0;
      case 2: return formData.skills.length > 0;
      case 3: return formData.availability.length > 0;
      case 4: return formData.goals.length > 0;
      case 5: return formData.location.length > 0;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Let's Find Your Perfect Match</h1>
          <p className="text-muted-foreground">
            Answer a few questions to discover volunteer opportunities tailored to you
          </p>
        </div>

        <div className="mb-6">
          <Progress value={progress} className="h-2" data-testid="progress-quiz" />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Step {step} of {totalSteps}
          </p>
        </div>

        <Card>
          <CardHeader>
            {step === 1 && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-6 w-6 text-primary" />
                  <CardTitle>What causes are you passionate about?</CardTitle>
                </div>
                <CardDescription>
                  Select all that interest you. We'll find opportunities that align with your passions.
                </CardDescription>
              </>
            )}
            {step === 2 && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  <CardTitle>What are your strengths and skills?</CardTitle>
                </div>
                <CardDescription>
                  Tell us what you're good at so we can match you with the right roles.
                </CardDescription>
              </>
            )}
            {step === 3 && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <CardTitle>When are you available?</CardTitle>
                </div>
                <CardDescription>
                  Select all times that work with your schedule.
                </CardDescription>
              </>
            )}
            {step === 4 && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-6 w-6 text-primary" />
                  <CardTitle>What are your goals?</CardTitle>
                </div>
                <CardDescription>
                  What do you hope to achieve through volunteering?
                </CardDescription>
              </>
            )}
            {step === 5 && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-6 w-6 text-primary" />
                  <CardTitle>Location & Service Hours</CardTitle>
                </div>
                <CardDescription>
                  Where would you like to volunteer, and do you have a service hours goal?
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {INTERESTS_OPTIONS.map(option => (
                  <div
                    key={option.value}
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer hover-elevate ${
                      formData.interests.includes(option.value)
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                    onClick={() => toggleArrayValue("interests", option.value)}
                    data-testid={`checkbox-interest-${option.value}`}
                  >
                    <Checkbox
                      checked={formData.interests.includes(option.value)}
                      onCheckedChange={() => toggleArrayValue("interests", option.value)}
                    />
                    <Label className="cursor-pointer flex-1">{option.label}</Label>
                  </div>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SKILLS_OPTIONS.map(option => (
                  <div
                    key={option.value}
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer hover-elevate ${
                      formData.skills.includes(option.value)
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                    onClick={() => toggleArrayValue("skills", option.value)}
                    data-testid={`checkbox-skill-${option.value}`}
                  >
                    <Checkbox
                      checked={formData.skills.includes(option.value)}
                      onCheckedChange={() => toggleArrayValue("skills", option.value)}
                    />
                    <Label className="cursor-pointer flex-1">{option.label}</Label>
                  </div>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AVAILABILITY_OPTIONS.map(option => (
                  <div
                    key={option.value}
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer hover-elevate ${
                      formData.availability.includes(option.value)
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                    onClick={() => toggleArrayValue("availability", option.value)}
                    data-testid={`checkbox-availability-${option.value}`}
                  >
                    <Checkbox
                      checked={formData.availability.includes(option.value)}
                      onCheckedChange={() => toggleArrayValue("availability", option.value)}
                    />
                    <Label className="cursor-pointer flex-1">{option.label}</Label>
                  </div>
                ))}
              </div>
            )}

            {step === 4 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {GOALS_OPTIONS.map(option => (
                  <div
                    key={option.value}
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer hover-elevate ${
                      formData.goals.includes(option.value)
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                    onClick={() => toggleArrayValue("goals", option.value)}
                    data-testid={`checkbox-goal-${option.value}`}
                  >
                    <Checkbox
                      checked={formData.goals.includes(option.value)}
                      onCheckedChange={() => toggleArrayValue("goals", option.value)}
                    />
                    <Label className="cursor-pointer flex-1">{option.label}</Label>
                  </div>
                ))}
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label>Location Preference</Label>
                  <div className="grid grid-cols-1 gap-3">
                    {LOCATION_OPTIONS.map(option => (
                      <div
                        key={option.value}
                        className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer hover-elevate ${
                          formData.location === option.value
                            ? "border-primary bg-primary/5"
                            : "border-border"
                        }`}
                        onClick={() => setFormData({ ...formData, location: option.value })}
                        data-testid={`radio-location-${option.value}`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          formData.location === option.value
                            ? "border-primary"
                            : "border-border"
                        }`}>
                          {formData.location === option.value && (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <Label className="cursor-pointer flex-1">{option.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="service-hours">
                    Service Hours Goal (Optional)
                  </Label>
                  <Input
                    id="service-hours"
                    type="number"
                    min="0"
                    placeholder="e.g., 40 hours this year"
                    value={formData.serviceHoursGoal || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      serviceHoursGoal: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                    data-testid="input-service-hours"
                  />
                  <p className="text-sm text-muted-foreground">
                    Many schools require 20-40 hours per year for graduation or honor societies.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between gap-4 mt-8">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1}
                data-testid="button-quiz-back"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              {step < totalSteps ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  data-testid="button-quiz-next"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed() || isLoading}
                  data-testid="button-quiz-submit"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Find My Matches
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
