import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertVolunteerHourSchema, type InsertVolunteerHour, type VolunteerHour } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Calendar, Clock, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { SignaturePad } from "@/components/SignaturePad";

export default function Tracker() {
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const { data: hours, isLoading } = useQuery<VolunteerHour[]>({
    queryKey: ["/api/hours"],
  });

  const form = useForm<InsertVolunteerHour>({
    resolver: zodResolver(insertVolunteerHourSchema),
    defaultValues: {
      activityTitle: "",
      date: format(new Date(), "yyyy-MM-dd"),
      hours: 1,
      verified: false,
      signature: "",
    },
  });

  const addHourMutation = useMutation({
    mutationFn: (data: InsertVolunteerHour) => apiRequest("POST", "/api/hours", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hours"] });
      toast({
        title: "Hours logged!",
        description: "Your volunteer hours have been recorded.",
      });
      form.reset();
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to log hours",
        description: error.message || "Please try again",
      });
    },
  });

  const deleteHourMutation = useMutation({
    mutationFn: (hourId: string) => apiRequest("DELETE", `/api/hours/${hourId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hours"] });
      toast({
        title: "Entry deleted",
        description: "The hour entry has been removed.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to delete",
        description: error.message || "Please try again",
      });
    },
  });

  const onSubmit = (data: InsertVolunteerHour) => {
    addHourMutation.mutate(data);
  };

  const totalHours = hours?.reduce((sum, entry) => sum + entry.hours, 0) || 0;
  const verifiedHours = hours?.filter(h => h.verified).reduce((sum, entry) => sum + entry.hours, 0) || 0;

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Hour Tracker</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage your volunteer service hours
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            data-testid="button-add-hours"
          >
            <Plus className="mr-2 h-4 w-4" />
            Log Hours
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-3xl font-bold" data-testid="text-total-hours">{totalHours}</p>
                <p className="text-sm text-muted-foreground">Total Hours</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-3xl font-bold" data-testid="text-verified-hours">{verifiedHours}</p>
                <p className="text-sm text-muted-foreground">Verified Hours</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Calendar className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-3xl font-bold" data-testid="text-entries">{hours?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Entries</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Hours Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Log New Hours</CardTitle>
              <CardDescription>
                Record your volunteer activity and hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="activityTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Activity Title</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., Park Cleanup at Riverside"
                            data-testid="input-activity-title"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="date"
                              data-testid="input-date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hours</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.5"
                              min="0.5"
                              max="24"
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              data-testid="input-hours"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="signature"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <SignaturePad
                            value={field.value}
                            onSave={(signature) => field.onChange(signature)}
                            onClear={() => field.onChange("")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={addHourMutation.isPending}
                      data-testid="button-submit-hours"
                    >
                      {addHourMutation.isPending ? "Saving..." : "Save Entry"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      data-testid="button-cancel-hours"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Hours Table */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>
              Your volunteer hour entries
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : hours && hours.length > 0 ? (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Signature</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hours.map((entry) => (
                      <TableRow key={entry.id} data-testid={`row-hour-${entry.id}`}>
                        <TableCell className="font-medium">
                          {format(new Date(entry.date), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>{entry.activityTitle}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {entry.hours} {entry.hours === 1 ? "hour" : "hours"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {entry.signature ? (
                            <img 
                              src={entry.signature} 
                              alt="Signature" 
                              className="h-12 w-24 object-contain border rounded dark:invert"
                              data-testid={`img-signature-${entry.id}`}
                            />
                          ) : (
                            <span className="text-muted-foreground text-sm" data-testid={`text-no-signature-${entry.id}`}>
                              No signature
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {entry.verified ? (
                            <Badge className="bg-green-500 text-white">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <XCircle className="mr-1 h-3 w-3" />
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteHourMutation.mutate(entry.id)}
                            disabled={deleteHourMutation.isPending}
                            data-testid={`button-delete-hour-${entry.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">No hours logged yet</p>
                <p className="text-muted-foreground mb-4">
                  Start tracking your volunteer hours to build your service record
                </p>
                <Button onClick={() => setShowForm(true)} data-testid="button-log-first-hours">
                  <Plus className="mr-2 h-4 w-4" />
                  Log Your First Hours
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
