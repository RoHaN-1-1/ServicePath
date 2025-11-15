import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Calendar } from "lucide-react";
import type { VolunteerHour } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface UserInfo {
  username: string;
  createdAt: string;
}

export function AccountStats() {
  const { data: userInfo, isLoading: userLoading } = useQuery<UserInfo>({
    queryKey: ["/api/me"],
  });

  const { data: hours, isLoading: hoursLoading } = useQuery<VolunteerHour[]>({
    queryKey: ["/api/hours"],
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

  if (userLoading || hoursLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" data-testid="account-stats">
      <Card className="hover-elevate">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="p-3 rounded-lg bg-primary/10">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Hours Logged</p>
            <p className="text-2xl font-bold" data-testid="text-total-hours">
              {totalHours.toFixed(1)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="hover-elevate">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="p-3 rounded-lg bg-primary/10">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Account Age</p>
            <p className="text-2xl font-bold" data-testid="text-account-age">
              {getAccountAge()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
