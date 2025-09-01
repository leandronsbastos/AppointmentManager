import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Login } from "@/pages/Login";
import DashboardPage from "@/pages/Dashboard";
import TicketsPage from "@/pages/Tickets";
import CustomersPage from "@/pages/Customers";
import ReportsPage from "@/pages/Reports";
import SettingsPage from "@/pages/Settings";
import NotFound from "@/pages/not-found";
import { authApi } from "@/lib/api";
import { useWebSocket } from "@/hooks/useWebSocket";

function Router() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { isConnected } = useWebSocket(token);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      // Set authorization header for all requests
      queryClient.setQueryData(["/api/auth/token"], storedToken);
      
      // Verify token and get user info
      authApi.me()
        .then(user => {
          setUser(user);
        })
        .catch(() => {
          localStorage.removeItem("token");
          setToken(null);
          queryClient.setQueryData(["/api/auth/token"], null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = (newToken: string, userData: any) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem("token", newToken);
    
    // Set default authorization header
    queryClient.setQueryData(["/api/auth/token"], newToken);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    queryClient.clear();
    queryClient.setQueryData(["/api/auth/token"], null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-muted-foreground">Carregando...</span>
        </div>
      </div>
    );
  }

  if (!user || !token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout user={user} onLogout={handleLogout}>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/tickets" component={TicketsPage} />
        <Route path="/customers" component={CustomersPage} />
        <Route path="/reports" component={ReportsPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
