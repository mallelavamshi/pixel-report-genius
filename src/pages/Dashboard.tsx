
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomNavBar from '@/components/CustomNavBar';
import TaskCard from '@/components/TaskCard';
import { useAnalysis } from '@/contexts/AnalysisContext';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileIcon, ImageIcon } from 'lucide-react';
import { toast } from "sonner";
import TaskTypeSelection from '@/components/TaskTypeSelection';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const Dashboard = () => {
  const navigate = useNavigate();
  const { tasks, createTask } = useAnalysis();
  const [isLoading, setIsLoading] = useState(true);
  const [showTaskTypeModal, setShowTaskTypeModal] = useState(false);
  
  // New state for task setup after selecting type
  const [selectedTaskType, setSelectedTaskType] = useState<'single-lot' | 'multi-lot' | null>(null);
  const [showTaskSetupModal, setShowTaskSetupModal] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');

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

  const handleTaskTypeSelect = (type: 'single-lot' | 'multi-lot') => {
    setSelectedTaskType(type);
    setShowTaskTypeModal(false);
    
    if (type === 'single-lot') {
      // For single-lot, create task immediately and navigate
      const newTask = createTask('single-lot');
      console.log("Created new single-lot task:", newTask);
      navigate(`/task/${newTask.id}`);
    } else {
      // For multi-lot, show setup modal first
      setShowTaskSetupModal(true);
    }
  };

  const handleCreateMultiLotTask = () => {
    if (!newTaskName.trim()) {
      toast.error("Please enter a task name");
      return;
    }
    
    const newTask = createTask('multi-lot');
    
    // Update the task with name and description
    if (newTask) {
      newTask.name = newTaskName;
      newTask.title = newTaskName;
      if (newTaskDescription) {
        newTask.description = newTaskDescription;
      }
      
      console.log("Created new multi-lot task:", newTask);
      navigate(`/task/${newTask.id}`);
    }
    
    // Reset state
    setShowTaskSetupModal(false);
    setNewTaskName('');
    setNewTaskDescription('');
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
        onSelect={handleTaskTypeSelect}
      />

      {/* Multi-Lot Task Setup Modal */}
      <Dialog open={showTaskSetupModal} onOpenChange={setShowTaskSetupModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Multi-Lot Task Setup</DialogTitle>
            <DialogDescription>
              Name your task and add an optional description.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="task-name" className="text-right">
                Task Name
              </Label>
              <Input
                id="task-name"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                placeholder="Enter task name"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="task-description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="task-description"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Optional description"
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTaskSetupModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateMultiLotTask}>
              Create & Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
