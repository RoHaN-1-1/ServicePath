import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReflectionSchema, type InsertReflection, type Reflection } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, BookOpen, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function Reflections() {
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const { data: reflections, isLoading } = useQuery<Reflection[]>({
    queryKey: ["/api/reflections"],
  });

  const form = useForm<InsertReflection>({
    resolver: zodResolver(insertReflectionSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const addReflectionMutation = useMutation({
    mutationFn: (data: InsertReflection) => apiRequest("POST", "/api/reflections", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reflections"] });
      toast({
        title: "Reflection saved!",
        description: "Your reflection has been recorded.",
      });
      form.reset();
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to save reflection",
        description: error.message || "Please try again",
      });
    },
  });

  const onSubmit = (data: InsertReflection) => {
    addReflectionMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Reflections</h1>
            <p className="text-muted-foreground mt-1">
              Document your volunteer experiences and learnings
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            data-testid="button-add-reflection"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Reflection
          </Button>
        </div>

        {/* Add Reflection Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Write a Reflection</CardTitle>
              <CardDescription>
                Share your thoughts, experiences, and what you learned
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                            placeholder="e.g., My Experience at Park Cleanup"
                            data-testid="input-reflection-title"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reflection</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="What did you do? What did you learn? How did it make you feel?"
                            className="min-h-32 resize-none"
                            data-testid="textarea-reflection-content"
                          />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">
                          {field.value?.length || 0} characters (minimum 10)
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={addReflectionMutation.isPending}
                      data-testid="button-submit-reflection"
                    >
                      {addReflectionMutation.isPending ? "Saving..." : "Save Reflection"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      data-testid="button-cancel-reflection"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Reflections List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : reflections && reflections.length > 0 ? (
          <div className="space-y-4">
            {reflections.map((reflection) => (
              <Card key={reflection.id} data-testid={`card-reflection-${reflection.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{reflection.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(reflection.date), "MMMM d, yyyy")}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap">{reflection.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No reflections yet</p>
              <p className="text-muted-foreground mb-4">
                Start documenting your volunteer experiences and insights
              </p>
              <Button onClick={() => setShowForm(true)} data-testid="button-write-first-reflection">
                <Plus className="mr-2 h-4 w-4" />
                Write Your First Reflection
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
