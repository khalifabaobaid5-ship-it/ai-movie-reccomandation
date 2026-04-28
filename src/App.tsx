import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppNav } from "@/components/AppNav";
import { WatchLaterPrompt } from "@/components/WatchLaterPrompt";
import LoginPage from "@/pages/LoginPage";
import HomePage from "@/pages/HomePage";
import SearchPage from "@/pages/SearchPage";
import MovieDetailPage from "@/pages/MovieDetailPage";
import RecommendationsPage from "@/pages/RecommendationsPage";

import RatingsPage from "@/pages/RatingsPage";
import ProfilePage from "@/pages/ProfilePage";
import WatchLaterPage from "@/pages/WatchLaterPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user } = useAuth();

  if (!user) return <LoginPage />;

  return (
    <>
      <AppNav />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <WatchLaterPrompt />
              <HomePage />
            </>
          }
        />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/movie/:id" element={<MovieDetailPage />} />
        <Route path="/watch-later" element={<WatchLaterPage />} />
        <Route path="/ratings" element={<RatingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
