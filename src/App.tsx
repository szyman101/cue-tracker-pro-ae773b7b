
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MatchHistory from "./pages/MatchHistory";
import NewMatch from "./pages/NewMatch";
import NewSeason from "./pages/NewSeason";
import MatchView from "./pages/MatchView";
import SeasonDetails from "./pages/SeasonDetails";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <DataProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/history" 
                element={
                  <ProtectedRoute>
                    <MatchHistory />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/new-match" 
                element={
                  <ProtectedRoute>
                    <NewMatch />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/new-season" 
                element={
                  <ProtectedRoute>
                    <NewSeason />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/match/:id" 
                element={
                  <ProtectedRoute>
                    <MatchView />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/season/:id" 
                element={
                  <ProtectedRoute>
                    <SeasonDetails />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
