import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Calendar, Trash2, AlertTriangle, User, Building2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { VolunteerHour } from "@shared/schema";

interface UserInfo {
  username: string;
  createdAt: string;
  accountType: "student" | "organization";
  organizationName?: string;
}

interface AccountInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccountDeleted: () => void;
}

export function AccountInfoDialog({ open, onOpenChange, onAccountDeleted }: AccountInfoDialogProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const { toast } = useToast();

  const { data: userInfo, isLoading: userLoading } = useQuery<UserInfo>({
    queryKey: ["/api/me"],
    enabled: open,
  });

  const { data: hours, isLoading: hoursLoading } = useQuery<VolunteerHour[]>({
    queryKey: ["/api/hours"],
    enabled: open,
  });

  const deleteMutation = useMutation({
    mutationFn: async (password: string) => {
      const res = await apiRequest("POST", "/api/account/delete", { password });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });
      queryClient.clear();
      onAccountDeleted();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Deletion failed",
        description: error.message || "Incorrect password",
      });
    },
  });

  const totalHours = hours?.reduce((sum, entry) => sum + entry.hours, 0) || 0;

  const getAccountAge = () => {
    if (!userInfo?.createdAt) return "0 days";
    
    const createdDate = new Date(userInfo.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day";
    if (diffDays < 30) return `${diffDays} days`;
    
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths === 1) return "1 month";
    if (diffMonths < 12) return `${diffMonths} months`;
    
    const diffYears = Math.floor(diffMonths / 12);
    return diffYears === 1 ? "1 year" : `${diffYears} years`;
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!deletePassword) {
      toast({
        variant: "destructive",
        title: "Password required",
        description: "Please enter your password to confirm deletion",
      });
      return;
    }
    deleteMutation.mutate(deletePassword);
  };

  const handleCloseDeleteDialog = () => {
    setShowDeleteConfirm(false);
    setDeletePassword("");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md" data-testid="dialog-account-info">
          <DialogHeader>
            <DialogTitle>Account Information</DialogTitle>
            <DialogDescription>
              View your account details and statistics
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Username */}
            <div>
              <Label className="text-sm text-muted-foreground">Username</Label>
              <p className="text-lg font-medium" data-testid="text-username-display">
                {userLoading ? <Skeleton className="h-6 w-32" /> : `@${userInfo?.username}`}
              </p>
            </div>

            {/* Account Type */}
            <div>
              <Label className="text-sm text-muted-foreground">Account Type</Label>
              {userLoading ? (
                <Skeleton className="h-6 w-40" />
              ) : (
                <div className="flex items-center gap-2 mt-1" data-testid="text-account-type">
                  {userInfo?.accountType === "organization" ? (
                    <>
                      <Building2 className="h-5 w-5 text-primary" />
                      <span className="text-lg font-medium">Organization</span>
                    </>
                  ) : (
                    <>
                      <User className="h-5 w-5 text-primary" />
                      <span className="text-lg font-medium">Student</span>
                    </>
                  )}
                </div>
              )}
              {userInfo?.accountType === "organization" && userInfo?.organizationName && (
                <p className="text-sm text-muted-foreground mt-1" data-testid="text-organization-name">
                  {userInfo.organizationName}
                </p>
              )}
            </div>

            {/* Statistics */}
            <div className="space-y-3">
              <Label className="text-sm text-muted-foreground">Statistics</Label>
              
              {userLoading || hoursLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : (
                <div className="space-y-2">
                  <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Hours Logged</p>
                        <p className="text-xl font-bold" data-testid="text-total-hours-dialog">
                          {totalHours.toFixed(1)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Account Age</p>
                        <p className="text-xl font-bold" data-testid="text-account-age-dialog">
                          {getAccountAge()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div className="pt-4 border-t">
              <Label className="text-sm text-muted-foreground">Danger Zone</Label>
              <div className="mt-2">
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  className="w-full gap-2"
                  data-testid="button-delete-account"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={handleCloseDeleteDialog}>
        <AlertDialogContent data-testid="dialog-delete-confirm">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <AlertDialogTitle>Delete Account</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="space-y-3">
              <p>This action cannot be undone. This will permanently delete your account and remove all your data including:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Volunteer hours ({totalHours.toFixed(1)} hours)</li>
                <li>Profile and preferences</li>
                <li>Reflections and activity history</li>
              </ul>
              <p className="font-semibold">Please enter your password to confirm:</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <Input
              type="password"
              placeholder="Enter your password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              data-testid="input-delete-password"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={handleCloseDeleteDialog}
              data-testid="button-cancel-delete"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
