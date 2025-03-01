
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Analysis from "./pages/Analysis";
import Task from "./pages/Task";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import { AnalysisProvider } from "./contexts/AnalysisContext";

const queryClient = new QueryClient();

// Check if user is authenticated
const isAuthenticated = () => {
  // For testing purposes, always return true
  // In a real app, you would check for a valid auth token
  return true;
};

// Check user role
const isAdmin = () => {
  // For testing purposes, return true or false based on localStorage
  return localStorage.getItem('userRole') === 'admin';
};

// Get user tier
const getUserTier = () => {
  // For testing purposes, return a tier from localStorage or default to 'basic'
  return localStorage.getItem('userTier') || 'basic';
};

const App = () => {
  const [userTier, setUserTier] = useState(getUserTier());
  
  // Update userTier when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setUserTier(getUserTier());
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AnalysisProvider>
          <BrowserRouter>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route 
                path="/dashboard" 
                element={
                  isAuthenticated() ? <Dashboard /> : <Navigate to="/" replace />
                } 
              />
              <Route 
                path="/analysis/:id" 
                element={
                  isAuthenticated() ? <Analysis /> : <Navigate to="/" replace />
                } 
              />
              <Route 
                path="/task/:id" 
                element={
                  isAuthenticated() ? <Task /> : <Navigate to="/" replace />
                } 
              />
              <Route 
                path="/admin" 
                element={
                  isAuthenticated() && isAdmin() ? 
                  <AdminDashboard /> : 
                  <Navigate to="/dashboard" replace />
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AnalysisProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
