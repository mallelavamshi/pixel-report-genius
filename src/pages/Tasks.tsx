import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomNavBar from '@/components/CustomNavBar';
import { useAnalysis } from '@/contexts/AnalysisContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileIcon, ImageIcon } from 'lucide-react';
import { toast } from "sonner";
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

const Tasks = () => {
  const navigate = useNavigate();
  const { createTask } = useAnalysis();
  
  // State for multi-lot task setup
  const [showTaskSetupModal, setShowTaskSetupModal] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');

  const handleSingleLotSelect = () => {
    // For single-lot, create task immediately and navigate
    const newTask = createTask('single-lot');
    console.log("Created new single-lot task:", newTask);
    navigate(`/task/${newTask.id}`);
  };

  const handleMultiLotSelect = () => {
    // For multi-lot, show setup modal first
    setShowTaskSetupModal(true);
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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-medium mb-8 text-center">Create New Task</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Single Lot Card */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ImageIcon className="h-5 w-5 mr-2" />
                  Single Image Analysis
                </CardTitle>
                <CardDescription>
                  Analyze a single image and get immediate results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground opacity-50" />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handleSingleLotSelect}>
                  Start Single Analysis
                </Button>
              </CardFooter>
            </Card>
            
            {/* Multi Lot Card */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileIcon className="h-5 w-5 mr-2" />
                  Multi-Image Analysis
                </CardTitle>
                <CardDescription>
                  Analyze multiple images and generate comprehensive reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-background rounded-sm p-2">
                      <ImageIcon className="h-8 w-8 text-muted-foreground opacity-50" />
                    </div>
                    <div className="bg-background rounded-sm p-2">
                      <ImageIcon className="h-8 w-8 text-muted-foreground opacity-50" />
                    </div>
                    <div className="bg-background rounded-sm p-2">
                      <ImageIcon className="h-8 w-8 text-muted-foreground opacity-50" />
                    </div>
                    <div className="bg-background rounded-sm p-2">
                      <ImageIcon className="h-8 w-8 text-muted-foreground opacity-50" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handleMultiLotSelect}>
                  Start Multi Analysis
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>

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

export default Tasks;
