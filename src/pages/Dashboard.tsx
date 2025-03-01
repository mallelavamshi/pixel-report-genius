
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAnalysis } from '@/contexts/AnalysisContext';
import { FileText } from 'lucide-react';
import TaskTypeSelection from '@/components/TaskTypeSelection';
import TaskHistory from '@/components/TaskHistory';

const Dashboard = () => {
  const { analyses, isLoading } = useAnalysis();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-16">
      <NavBar />
      
      <main className="container mx-auto px-4 pt-28">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl font-medium mb-4">AI Image Analysis</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload images for AI-powered analysis and generate detailed reports.
            </p>
          </div>
          
          <div className="mb-12 animate-fade-in opacity-0" style={{ animationDelay: '200ms' }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-medium">
                  Get Started
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <TaskTypeSelection />
              </CardContent>
            </Card>
          </div>
          
          <div className="animate-fade-in opacity-0" style={{ animationDelay: '400ms' }}>
            <TaskHistory />
          </div>
          
          {analyses.length === 0 && !isLoading && analyses.length === 0 && (
            <div className="text-center py-12 animate-fade-in opacity-0" style={{ animationDelay: '400ms' }}>
              <div className="mb-4 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-medium mb-2">No analyses yet</h3>
                <p className="max-w-md mx-auto">
                  Upload your first image to start analyzing and get detailed insights.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
