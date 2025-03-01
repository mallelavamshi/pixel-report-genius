
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileIcon, ImageIcon, Plus } from 'lucide-react';
import { useAnalysis } from '@/contexts/AnalysisContext';
import NavBar from '@/components/NavBar';
import TaskTypeSelection from '@/components/TaskTypeSelection';
import TaskHistory from '@/components/TaskHistory';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const Dashboard = () => {
  const { addTask, tasks } = useAnalysis();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('in-progress');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskType, setTaskType] = useState<'single-lot' | 'multi-lot'>('single-lot');
  
  // Split tasks into pending and completed
  const pendingTasks = tasks.filter(task => ['pending', 'processing'].includes(task.status));
  const completedTasks = tasks.filter(task => task.status === 'completed');

  const handleCreateTask = () => {
    if (!taskName.trim()) {
      toast.error('Task name is required');
      return;
    }

    const newTask = {
      id: uuidv4(),
      name: taskName,
      description: taskDescription,
      type: taskType,
      status: 'pending',
      createdAt: new Date(),
      images: [],
    };

    addTask(newTask);
    setIsCreateDialogOpen(false);
    toast.success('Task created successfully');
    
    // Reset form
    setTaskName('');
    setTaskDescription('');
    setTaskType('single-lot');
    
    // Navigate to the new task
    navigate(`/task/${newTask.id}`);
  };

  return (
    <div className="min-h-screen pb-16">
      <NavBar />
      
      <main className="container mx-auto px-4 pt-28">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-medium">Dashboard</h1>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <DialogDescription>
                    Create a new task for image analysis.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="task-name">Task Name</Label>
                    <Input 
                      id="task-name" 
                      placeholder="Enter task name" 
                      value={taskName}
                      onChange={(e) => setTaskName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="task-description">Description (Optional)</Label>
                    <Textarea 
                      id="task-description" 
                      placeholder="Enter task description" 
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Task Type</Label>
                    <TaskTypeSelection 
                      value={taskType} 
                      onChange={setTaskType}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTask}>
                    Create Task
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{tasks.length}</div>
                <p className="text-muted-foreground text-sm">Total tasks created</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{pendingTasks.length}</div>
                <p className="text-muted-foreground text-sm">Tasks awaiting completion</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{completedTasks.length}</div>
                <p className="text-muted-foreground text-sm">Successfully completed tasks</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Quick Start</CardTitle>
                <CardDescription>
                  Create a new task to analyze images
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="border-dashed cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => {
                    setTaskType('single-lot');
                    setIsCreateDialogOpen(true);
                  }}
                >
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <ImageIcon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-medium">Single-Lot Analysis</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Analyze a single image in detail
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-dashed cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => {
                    setTaskType('multi-lot');
                    setIsCreateDialogOpen(true);
                  }}
                >
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <FileIcon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-medium">Multi-Lot Analysis</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Process multiple images at once
                    </p>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="all">All Tasks</TabsTrigger>
              </TabsList>
              
              <TabsContent value="in-progress">
                <TaskHistory tasks={pendingTasks} type="pending" />
              </TabsContent>
              
              <TabsContent value="completed">
                <TaskHistory tasks={completedTasks} type="completed" />
              </TabsContent>
              
              <TabsContent value="all">
                <TaskHistory type="all" />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
