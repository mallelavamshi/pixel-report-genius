
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Analysis from "./pages/Analysis";
import Task from "./pages/Task";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import { AnalysisProvider } from "./contexts/AnalysisContext";

const queryClient = new QueryClient();

// This would typically come from authentication context
const isAdmin = () => {
  // For testing purposes, return true or false based on localStorage
  return localStorage.getItem('userRole') === 'admin';
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AnalysisProvider>
        <BrowserRouter>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analysis/:id" element={<Analysis />} />
            <Route path="/task/:id" element={<Task />} />
            <Route 
              path="/admin" 
              element={isAdmin() ? <AdminDashboard /> : <Navigate to="/dashboard" replace />} 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AnalysisProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
