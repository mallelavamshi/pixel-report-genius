
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, FileText, Grid, Image, ChevronDown, ChevronUp } from 'lucide-react';
import { useAnalysis } from '@/contexts/AnalysisContext';
import { Task, TaskStatus } from '@/contexts/AnalysisContext';

const getStatusColor = (status: TaskStatus) => {
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

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date);
};

const TaskHistory = () => {
  const { tasks } = useAnalysis();
  const navigate = useNavigate();
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const toggleExpandTask = (taskId: string) => {
    setExpandedTaskId(prev => prev === taskId ? null : taskId);
  };

  const handleViewTask = (taskId: string) => {
    navigate(`/task/${taskId}`);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-medium mb-4">Task History</h2>
      
      {tasks.length === 0 ? (
        <div className="text-center p-8 border border-dashed rounded-lg">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
          <p className="text-muted-foreground">
            Create your first analysis task to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <Card key={task.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center text-lg">
                      {task.type === 'multi-lot' ? (
                        <Grid className="h-4 w-4 mr-2" />
                      ) : (
                        <Image className="h-4 w-4 mr-2" />
                      )}
                      {task.name}
                    </CardTitle>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(task.createdAt)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(task.createdAt)}
                      </div>
                      <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => toggleExpandTask(task.id)}
                  >
                    {expandedTaskId === task.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              
              {expandedTaskId === task.id && (
                <CardContent>
                  {task.description && (
                    <p className="text-sm mb-3 text-muted-foreground">
                      {task.description}
                    </p>
                  )}
                  
                  <div className="text-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Task Type:</span>
                      <span>{task.type === 'multi-lot' ? 'Multi-Lot Analysis' : 'Single-Lot Analysis'}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Images:</span>
                      <span>{task.images.length}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Created:</span>
                      <span>{formatDate(task.createdAt)} {formatTime(task.createdAt)}</span>
                    </div>
                    {task.completedAt && (
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Completed:</span>
                        <span>{formatDate(task.completedAt)} {formatTime(task.completedAt)}</span>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full mt-4"
                    onClick={() => handleViewTask(task.id)}
                  >
                    View Task
                  </Button>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskHistory;
