import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppProvider } from "@/lib/store";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Journal from "@/pages/Journal";
import Tasks from "@/pages/Tasks";
import Focus from "@/pages/Focus";
import Calendar from "@/pages/Calendar";
import Analytics from "@/pages/Analytics";
import Profile from "@/pages/Profile";
import Habits from "@/pages/Habits";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

const ProtectedRoute = () => {
  const { session } = useAuth();
  if (!session) {
    return <Navigate to="/auth" replace />;
  }
  return <Outlet />;
};

import SplashScreen from "@/components/SplashScreen";
import { useState, useEffect } from "react"; // Added useEffect
import { NotificationManager } from './lib/notifications'; // Added NotificationManager import

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Init Notifications and App
  useEffect(() => {
    const initApp = async () => {
      // Non-blocking init
      try {
        await NotificationManager.init();
        await NotificationManager.scheduleDailyTaskSummary();
        await NotificationManager.scheduleDailyJournalSummary();
      } catch (e) {
        console.error("Initialization error:", e);
      }
    };
    initApp();

    // Splash screen timer - Guaranteed to run
    const timer = setTimeout(() => setIsLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="arise-theme">
        <AuthProvider>
          <AppProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              {isLoading && <SplashScreen />} {/* Modified SplashScreen rendering */}
              <HashRouter>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Layout />}>
                      <Route index element={<Home />} />
                      <Route path="journal" element={<Journal />} />
                      <Route path="tasks" element={<Tasks />} />
                      <Route path="focus" element={<Focus />} />
                      <Route path="calendar" element={<Calendar />} />
                      <Route path="analytics" element={<Analytics />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="habits" element={<Habits />} />
                    </Route>
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </HashRouter>
            </TooltipProvider>
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider >
  );
};

export default App;
