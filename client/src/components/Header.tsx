import { useState } from "react";
import { User, LogOut, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useLocation } from "wouter";

interface HeaderProps {
  username: string;
  onLogout: () => void;
}

export function Header({ username, onLogout }: HeaderProps) {
  const [, setLocation] = useLocation();

  const handleAccountInfo = () => {
    setLocation("/dashboard");
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b bg-background">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-semibold">
          V
        </div>
        <h1 className="text-xl font-bold">VolunteerMatch</h1>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="gap-2"
              data-testid="button-account-menu"
            >
              <UserCircle className="h-5 w-5" />
              <span className="hidden sm:inline">@{username}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={handleAccountInfo}
              data-testid="button-account-info"
            >
              <User className="mr-2 h-4 w-4" />
              Account Info
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onLogout}
              data-testid="button-sign-out"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
