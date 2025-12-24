import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertOpportunitySchema, type VolunteerOpportunity, type InsertOpportunity, type Announcement } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, MapPin, Clock, Loader2, Users, Calendar, Megaphone } from "lucide-react";

const CATEGORIES = [
  { value: "environment", label: "Environment & Nature" },
  { value: "tutoring", label: "Education & Training" },
  { value: "animals", label: "Animal Welfare" },
  { value: "arts", label: "Arts & Culture" },
  { value: "technology", label: "Technology & STEM" },
  { value: "community", label: "Community Service" },
  { value: "seniors", label: "Senior Care" },
  { value: "youth", label: "Youth Mentoring" },
];

interface UserInfo {
  organizationName?: string;
  organizationDescription?: string;
}

interface OrganizationDashboardProps {
  organizationName?: string;
  organizationDescription?: string;
}

export default function OrganizationDashboard({ organizationName }: OrganizationDashboardProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<VolunteerOpportunity | null>(null);
  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false);
  const [announcementContent, setAnnouncementContent] = useState("");

  const { data: userInfo } = useQuery<UserInfo>({
    queryKey: ["/api/me"],
  });

  const { data: opportunities = [], isLoading } = useQuery<VolunteerOpportunity[]>({
    queryKey: ["/api/organization/opportunities"],
  });

  const { data: announcements = [] } = useQuery<Announcement[]>({
    queryKey: ["/api/organization/announcements"],
  });

  const form = useForm<InsertOpportunity>({
    resolver: zodResolver(insertOpportunitySchema),
    defaultValues: {
      title: "",
      location: "",
      requirements: "",
      description: "",
      category: [],
      skills: [],
      timeCommitment: "",
      remote: false,
      tags: [],
      eventDate: "",
      eventTime: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertOpportunity) => {
      const res = await apiRequest("POST", "/api/organization/opportunities", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organization/opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      toast({ title: "Opportunity created successfully!" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertOpportunity }) => {
      const res = await apiRequest("PUT", `/api/organization/opportunities/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organization/opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      toast({ title: "Opportunity updated successfully!" });
      setIsDialogOpen(false);
      setEditingOpportunity(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/organization/opportunities/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organization/opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      toast({ title: "Opportunity deleted successfully!" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/organization/announcements", { content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organization/announcements"] });
      toast({ title: "Announcement posted!" });
      setIsAnnouncementDialogOpen(false);
      setAnnouncementContent("");
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/organization/announcements/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organization/announcements"] });
      toast({ title: "Announcement deleted" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const handleOpenCreate = () => {
    setEditingOpportunity(null);
    form.reset({
      title: "",
      location: "",
      requirements: "",
      description: "",
      category: [],
      skills: [],
      timeCommitment: "",
      remote: false,
      tags: [],
      eventDate: "",
      eventTime: "",
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (opportunity: VolunteerOpportunity) => {
    setEditingOpportunity(opportunity);
    form.reset({
      title: opportunity.title,
      location: opportunity.location,
      requirements: opportunity.requirements,
      description: opportunity.description,
      category: opportunity.category,
      skills: opportunity.skills,
      timeCommitment: opportunity.timeCommitment,
      remote: opportunity.remote,
      tags: opportunity.tags,
      eventDate: opportunity.eventDate || "",
      eventTime: opportunity.eventTime || "",
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: InsertOpportunity) => {
    if (editingOpportunity) {
      updateMutation.mutate({ id: editingOpportunity.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handlePostAnnouncement = () => {
    if (!announcementContent.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Announcement cannot be empty" });
      return;
    }
    createAnnouncementMutation.mutate(announcementContent.trim());
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content Area */}
        <div className="flex-1">
          {/* Greeting */}
          <h1 className="text-3xl font-bold mb-6" data-testid="text-greeting">
            Hello, {organizationName || "Organization"}
          </h1>

          {/* Post Opportunities Button */}
          <Button
            onClick={handleOpenCreate}
            size="lg"
            className="mb-8 text-lg px-6"
            data-testid="button-create-opportunity"
          >
            <Plus className="mr-2 h-5 w-5" />
            Post Opportunities!
          </Button>

          {/* Upcoming Events Section */}
          <div>
            <h2 className="text-2xl font-bold mb-4" data-testid="text-upcoming-events">
              Upcoming Events!!!
            </h2>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : opportunities.length === 0 ? (
              <Card className="border-2 border-dashed">
                <CardContent className="py-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    No events posted yet. Click "Post Opportunities!" to create your first event.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {opportunities.map((opportunity) => (
                  <Card key={opportunity.id} data-testid={`card-opportunity-${opportunity.id}`}>
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2" data-testid={`text-event-name-${opportunity.id}`}>
                            {opportunity.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            {opportunity.eventDate && (
                              <span className="flex items-center gap-1" data-testid={`text-event-date-${opportunity.id}`}>
                                <Calendar className="h-4 w-4" />
                                {new Date(opportunity.eventDate).toLocaleDateString()}
                                {opportunity.eventTime && ` at ${opportunity.eventTime}`}
                              </span>
                            )}
                            <span className="flex items-center gap-1" data-testid={`text-event-time-${opportunity.id}`}>
                              <Clock className="h-4 w-4" />
                              {opportunity.timeCommitment}
                            </span>
                            <span className="flex items-center gap-1" data-testid={`text-event-location-${opportunity.id}`}>
                              <MapPin className="h-4 w-4" />
                              {opportunity.location}
                            </span>
                            <span className="flex items-center gap-1" data-testid={`text-event-spots-${opportunity.id}`}>
                              <Users className="h-4 w-4" />
                              Open spots
                            </span>
                            {opportunity.remote && (
                              <Badge variant="secondary">Remote</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleOpenEdit(opportunity)}
                            data-testid={`button-edit-${opportunity.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                data-testid={`button-delete-${opportunity.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Opportunity?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete "{opportunity.title}". This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate(opportunity.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  data-testid={`button-confirm-delete-${opportunity.id}`}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-80 space-y-6">
          {/* Announcements Section */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-lg">Announcements</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAnnouncementDialogOpen(true)}
                  data-testid="button-add-announcement"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {announcements.length === 0 ? (
                <p className="text-sm text-muted-foreground" data-testid="text-no-announcements">
                  No announcements yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="p-3 rounded-md bg-muted/50 relative group"
                      data-testid={`announcement-${announcement.id}`}
                    >
                      <p className="text-sm pr-6">{announcement.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                        onClick={() => deleteAnnouncementMutation.mutate(announcement.id)}
                        data-testid={`button-delete-announcement-${announcement.id}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* About Your Org Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">About Your Org</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground" data-testid="text-org-description">
                {userInfo?.organizationDescription || "No description provided."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Announcement Dialog */}
      <Dialog open={isAnnouncementDialogOpen} onOpenChange={setIsAnnouncementDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Add Announcement
            </DialogTitle>
            <DialogDescription>
              Post an announcement for your organization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Write your announcement here..."
              value={announcementContent}
              onChange={(e) => setAnnouncementContent(e.target.value)}
              rows={4}
              maxLength={500}
              data-testid="input-announcement-content"
            />
            <p className="text-xs text-muted-foreground text-right">
              {announcementContent.length}/500
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAnnouncementDialogOpen(false);
                  setAnnouncementContent("");
                }}
                data-testid="button-cancel-announcement"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePostAnnouncement}
                disabled={createAnnouncementMutation.isPending || !announcementContent.trim()}
                data-testid="button-post-announcement"
              >
                {createAnnouncementMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Post
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Opportunity Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingOpportunity ? "Edit Opportunity" : "Post New Opportunity"}
            </DialogTitle>
            <DialogDescription>
              {editingOpportunity 
                ? "Update the details of your volunteer opportunity."
                : "Create a new volunteer opportunity for students to discover."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Park Cleanup Volunteer"
                        data-testid="input-opportunity-title"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Riverside Park"
                          data-testid="input-opportunity-location"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timeCommitment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Commitment</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., 3 hours/week"
                          data-testid="input-opportunity-time"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="eventDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Date</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          data-testid="input-opportunity-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eventTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Time</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="time"
                          data-testid="input-opportunity-event-time"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requirements</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Ages 14+, in-person"
                        data-testid="input-opportunity-requirements"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe the volunteer opportunity, what volunteers will do, and the impact they'll make..."
                        rows={4}
                        data-testid="input-opportunity-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={() => (
                  <FormItem>
                    <FormLabel>Categories</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {CATEGORIES.map((cat) => (
                        <FormField
                          key={cat.value}
                          control={form.control}
                          name="category"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={cat.value}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(cat.value)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, cat.value])
                                        : field.onChange(
                                            field.value?.filter((value) => value !== cat.value)
                                          );
                                    }}
                                    data-testid={`checkbox-category-${cat.value}`}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                  {cat.label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="remote"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Remote/Virtual Opportunity</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Can volunteers participate remotely?
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-remote"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} data-testid="button-submit-opportunity">
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingOpportunity ? "Update" : "Create"} Opportunity
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
