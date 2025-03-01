
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomNavBar from '@/components/CustomNavBar';
import TaskCard from '@/components/TaskCard';
import { useAnalysis } from '@/contexts/AnalysisContext';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const Dashboard = () => {
  const navigate = useNavigate();
  const { tasks } = useAnalysis();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
      console.log("Dashboard loaded, tasks:", tasks);
    }, 500);
  }, [tasks]);

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

  return (
    <div className="min-h-screen pb-16">
      <CustomNavBar />

      <main className="container mx-auto px-4 pt-28">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-medium">Task History</h1>
          <Button onClick={handleCreateNewTask}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New Task
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid grid-cols-4 mb-4 w-full max-w-md">
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <p className="text-center text-gray-500">Loading tasks...</p>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No tasks found.</p>
            <Button onClick={handleCreateNewTask}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Your First Task
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
