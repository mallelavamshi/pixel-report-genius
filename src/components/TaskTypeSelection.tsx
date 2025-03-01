
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Grid, Image } from 'lucide-react';
import { useAnalysis } from '@/contexts/AnalysisContext';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from "sonner";

const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

const TaskTypeSelection = () => {
  const [isMultiLotDialogOpen, setIsMultiLotDialogOpen] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const { addTask, setCurrentTask } = useAnalysis();
  const navigate = useNavigate();

  const handleMultiLotSelection = () => {
    setIsMultiLotDialogOpen(true);
  };

  const handleSingleLotSelection = () => {
    const newTask = {
      id: generateId(),
      name: `Single Analysis ${new Date().toLocaleString()}`,
      type: 'single-lot' as const,
      status: 'pending' as const,
      createdAt: new Date(),
      images: []
    };
    
    addTask(newTask);
    setCurrentTask(newTask);
    toast.success("Single-lot task created");
    navigate('/task/' + newTask.id);
  };

  const handleMultiLotTaskCreate = () => {
    if (!taskName.trim()) {
      toast.error("Task name is required");
      return;
    }

    const newTask = {
      id: generateId(),
      name: taskName,
      description: taskDescription || undefined,
      type: 'multi-lot' as const,
      status: 'pending' as const,
      createdAt: new Date(),
      images: []
    };
    
    addTask(newTask);
    setCurrentTask(newTask);
    setIsMultiLotDialogOpen(false);
    setTaskName('');
    setTaskDescription('');
    toast.success("Multi-lot task created");
    navigate('/task/' + newTask.id);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={handleSingleLotSelection}
        >
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Image className="h-5 w-5" />
              <span>Single Lot Analysis</span>
            </CardTitle>
            <CardDescription>
              Analyze a single image quickly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Upload one image for immediate analysis without creating a task. Best for quick checks.
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={handleMultiLotSelection}
        >
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Grid className="h-5 w-5" />
              <span>Multi Lot Analysis</span>
            </CardTitle>
            <CardDescription>
              Process multiple images in a batch
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Create a named task to analyze multiple images and generate a comprehensive report.
            </p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isMultiLotDialogOpen} onOpenChange={setIsMultiLotDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Multi-Lot Task</DialogTitle>
            <DialogDescription>
              Enter a name and optional description for your task.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="task-name" className="text-sm font-medium">
                Task Name
              </label>
              <Input 
                id="task-name" 
                value={taskName} 
                onChange={(e) => setTaskName(e.target.value)} 
                placeholder="Enter task name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="task-description" className="text-sm font-medium">
                Description (Optional)
              </label>
              <Textarea 
                id="task-description" 
                value={taskDescription} 
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Enter task description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMultiLotDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleMultiLotTaskCreate}>
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskTypeSelection;
