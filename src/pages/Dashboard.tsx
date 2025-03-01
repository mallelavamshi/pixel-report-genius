
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAnalysis } from '@/contexts/AnalysisContext';
import { FileText, Clock } from 'lucide-react';
import TaskTypeSelection from '@/components/TaskTypeSelection';
import TaskHistory from '@/components/TaskHistory';

const Dashboard = () => {
  const { analyses, isLoading, tasks } = useAnalysis();
  const navigate = useNavigate();

  const pendingTasks = tasks.filter(task => task.status === 'pending' || task.status === 'processing');
  const completedTasks = tasks.filter(task => task.status === 'completed');

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
          
          <div className="space-y-8 animate-fade-in opacity-0" style={{ animationDelay: '400ms' }}>
            {pendingTasks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    In Progress Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TaskHistory tasks={pendingTasks} type="pending" />
                </CardContent>
              </Card>
            )}
            
            {completedTasks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Completed Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TaskHistory tasks={completedTasks} type="completed" />
                </CardContent>
              </Card>
            )}
            
            {tasks.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <div className="mb-4 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-medium mb-2">No tasks yet</h3>
                  <p className="max-w-md mx-auto">
                    Create your first task above to start analyzing images and get detailed insights.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
