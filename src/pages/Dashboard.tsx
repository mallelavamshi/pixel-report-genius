
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomNavBar from '@/components/CustomNavBar';
import TaskCard from '@/components/TaskCard';
import { useAnalysis } from '@/contexts/AnalysisContext';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { toast } from "sonner";
import TaskTypeSelection from '@/components/TaskTypeSelection';

const Dashboard = () => {
  const navigate = useNavigate();
  const { tasks, createTask } = useAnalysis();
  const [isLoading, setIsLoading] = useState(true);
  const [showTaskTypeModal, setShowTaskTypeModal] = useState(false);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
      console.log("Dashboard loaded, tasks:", tasks);
    }, 500);

    // Check if this is the first time loading the dashboard
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    
    if (!hasSeenWelcome) {
      // Show welcome message with API key information
      toast.info(
        "Ready for image analysis",
        {
          description: "The application is ready for image analysis. Contact admin for access.",
          duration: 5000,
        }
      );
      localStorage.setItem('hasSeenWelcome', 'true');
    }
  }, [tasks]);

  const handleCreateTask = (type: 'single-lot' | 'multi-lot') => {
    const newTask = createTask(type);
    console.log("Created new task:", newTask);
    navigate(`/task/${newTask.id}`);
    setShowTaskTypeModal(false);
  };

  return (
    <div className="min-h-screen pb-16">
      <CustomNavBar />

      <main className="container mx-auto px-4 pt-28">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-medium">Dashboard</h1>
          <Button onClick={() => setShowTaskTypeModal(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-500">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No tasks created yet.</p>
            <Button onClick={() => setShowTaskTypeModal(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Your First Task
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </main>

      {/* Task Type Selection Modal */}
      <TaskTypeSelection 
        isOpen={showTaskTypeModal} 
        onClose={() => setShowTaskTypeModal(false)}
        onSelect={handleCreateTask}
      />
    </div>
  );
};

export default Dashboard;
