
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomNavBar from '@/components/CustomNavBar';
import TaskCard from '@/components/TaskCard';
import { useAnalysis } from '@/contexts/AnalysisContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const navigate = useNavigate();
  const { tasks, deleteTask, fetchUserTasks } = useAnalysis();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  
  useEffect(() => {
    const loadUserTasks = async () => {
      setIsLoading(true);
      if (user) {
        try {
          await fetchUserTasks(user.id);
        } catch (error) {
          console.error("Error fetching user tasks:", error);
          toast.error("Failed to load your tasks");
        }
      }
      setIsLoading(false);
    };

    loadUserTasks();
  }, [user, fetchUserTasks]);

  // Filter tasks based on active tab
  const filteredTasks = tasks.filter(task => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return task.status === "pending" || task.status === "processing";
    if (activeTab === "completed") return task.status === "completed";
    if (activeTab === "failed") return task.status === "failed";
    return true;
  });

  const handleCreateNewTask = () => {
    navigate('/tasks');
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  return (
    <div className="min-h-screen pb-16 bg-gradient-to-br from-white to-[#F6F6F7] page-container">
      <CustomNavBar />

      <main className="container mx-auto px-4 pt-28">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-medium bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] bg-clip-text text-transparent">Task History</h1>
          <Button 
            onClick={handleCreateNewTask} 
            size="sm"
            className="bg-[#8B5CF6] hover:bg-[#7E69AB] text-white shadow-sm"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New Task
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid grid-cols-4 mb-4 w-full max-w-md bg-[#F1F0FB] p-1">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-[#8B5CF6] data-[state=active]:text-white"
            >
              All Tasks
            </TabsTrigger>
            <TabsTrigger 
              value="pending"
              className="data-[state=active]:bg-[#8B5CF6] data-[state=active]:text-white"
            >
              Pending
            </TabsTrigger>
            <TabsTrigger 
              value="completed"
              className="data-[state=active]:bg-[#8B5CF6] data-[state=active]:text-white"
            >
              Completed
            </TabsTrigger>
            <TabsTrigger 
              value="failed"
              className="data-[state=active]:bg-[#8B5CF6] data-[state=active]:text-white"
            >
              Failed
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <p className="text-center text-gray-500">Loading tasks...</p>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm p-8">
            <p className="text-gray-600 mb-4">No tasks found.</p>
            <Button 
              onClick={handleCreateNewTask}
              size="sm"
              className="bg-[#8B5CF6] hover:bg-[#7E69AB] text-white"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Your First Task
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onDelete={() => handleDeleteTask(task.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
