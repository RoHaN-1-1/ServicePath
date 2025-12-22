import { useState, useEffect } from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Header } from "@/components/Header";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import OrganizationDashboard from "@/pages/OrganizationDashboard";
import Quiz from "@/pages/Quiz";
import Tracker from "@/pages/Tracker";
import Reflections from "@/pages/Reflections";
import Share from "@/pages/Share";
import Search from "@/pages/Search";
import NotFound from "@/pages/not-found";
import type { AccountType } from "@shared/schema";

interface UserInfo {
  username: string;
  accountType: AccountType;
  organizationName?: string;
}

function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Verify session with server on page load
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/me", { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(true);
          setUserInfo({
            username: data.username,
            accountType: data.accountType || "student",
            organizationName: data.organizationName,
          });
          sessionStorage.setItem("authenticated", "true");
          sessionStorage.setItem("username", data.username);
          sessionStorage.setItem("accountType", data.accountType || "student");
        } else {
          // Session invalid, clear storage
          sessionStorage.removeItem("authenticated");
          sessionStorage.removeItem("username");
          sessionStorage.removeItem("accountType");
        }
      } catch (error) {
        // Network error or not authenticated
        sessionStorage.removeItem("authenticated");
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("accountType");
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = async (user: string) => {
    // Fetch full user info after login
    try {
      const response = await fetch("/api/me", { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setUserInfo({
          username: data.username,
          accountType: data.accountType || "student",
          organizationName: data.organizationName,
        });
        sessionStorage.setItem("accountType", data.accountType || "student");
      } else {
        setUserInfo({ username: user, accountType: "student" });
      }
    } catch {
      setUserInfo({ username: user, accountType: "student" });
    }
    setIsAuthenticated(true);
    sessionStorage.setItem("authenticated", "true");
    sessionStorage.setItem("username", user);
  };

  const handleLogout = async () => {
    try {
      // Call logout API to clear server-side session
      await fetch("/api/logout", { method: "POST", credentials: "include" });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear client-side state regardless of API success
      setIsAuthenticated(false);
      setUserInfo(null);
      sessionStorage.removeItem("authenticated");
      sessionStorage.removeItem("username");
      sessionStorage.removeItem("accountType");
      queryClient.clear();
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" data-testid="loading-auth"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !userInfo) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const isOrganization = userInfo.accountType === "organization";

  return (
    <div className="min-h-screen flex flex-col">
      <Header username={userInfo.username} onLogout={handleLogout} />
      <div className="flex-1">
        {isOrganization ? (
          <Switch>
            <Route path="/" component={() => <Redirect to="/dashboard" />} />
            <Route path="/dashboard" component={() => (
              <OrganizationDashboard organizationName={userInfo.organizationName} />
            )} />
            <Route component={NotFound} />
          </Switch>
        ) : (
          <Switch>
            <Route path="/" component={() => <Redirect to="/dashboard" />} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/quiz" component={Quiz} />
            <Route path="/tracker" component={Tracker} />
            <Route path="/reflections" component={Reflections} />
            <Route path="/share" component={Share} />
            <Route path="/search" component={Search} />
            <Route component={NotFound} />
          </Switch>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
