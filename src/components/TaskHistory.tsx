
import { useState } from 'react';
import { useAnalysis } from '@/contexts/AnalysisContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Grid, Image as ImageIcon, Clock, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

type TaskHistoryProps = {
  tasks?: Array<any>;
  type?: 'all' | 'pending' | 'completed';
};

const TaskHistory = ({ tasks, type = 'all' }: TaskHistoryProps) => {
  const { tasks: allTasks } = useAnalysis();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Use provided tasks or all tasks from context
  const tasksToDisplay = tasks || allTasks;
  
  // Sort tasks by creation date, newest first
  const sortedTasks = [...tasksToDisplay].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Apply search filtering
  const filteredTasks = sortedTasks.filter(task => {
    // Apply search filter if there's a search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        task.name.toLowerCase().includes(searchLower) || 
        (task.description && task.description.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (filteredTasks.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">
          {type === 'pending' ? 'No in-progress tasks' : 
           type === 'completed' ? 'No completed tasks' : 'No tasks found'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="relative w-full mb-4">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/70" />
        <Input
          type="text"
          placeholder="Search tasks..."
          className="pl-8 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-accent/50 p-2 rounded-full">
                    {task.type === 'multi-lot' ? (
                      <Grid className="h-5 w-5" />
                    ) : (
                      <ImageIcon className="h-5 w-5" />
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">
                        {task.name}
                      </h3>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </Badge>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{new Date(task.createdAt).toLocaleString()}</span>
                      </div>
                      <div>
                        {task.images.length} image{task.images.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center sm:self-center sm:flex-col sm:items-end gap-2">
                  <Button
                    size="sm"
                    onClick={() => navigate(`/task/${task.id}`)}
                    className="w-full sm:w-auto"
                  >
                    <span className="sm:mr-2">View</span>
                    <ArrowRight className="h-4 w-4 hidden sm:block" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TaskHistory;
