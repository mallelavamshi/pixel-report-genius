import { Link } from 'react-router-dom';
import { formatDistance } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { Task } from '@/contexts/AnalysisContext';
import { Button } from '@/components/ui/button';

interface TaskCardProps {
  task: Task;
}

const TaskCard = ({ task }: TaskCardProps) => {
  // Safely format the date - handle potential invalid date values
  const getTimeAgo = () => {
    try {
      // Check if createdAt exists and is a valid date
      if (task.createdAt && !isNaN(new Date(task.createdAt).getTime())) {
        return formatDistance(new Date(task.createdAt), new Date(), { addSuffix: true });
      }
      // If not valid, return a fallback
      return "recently";
    } catch (error) {
      console.error("Error formatting date:", error);
      return "recently";
    }
  };
  
  // Use the first image as the task image if available
  const taskImage = task.images && task.images.length > 0 ? task.images[0].imageUrl : undefined;
  const taskTitle = task.name || 'Untitled Task';
  const timeAgo = getTimeAgo();
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-0">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium truncate">
            {taskTitle}
          </CardTitle>
          <Badge variant={task.status === 'completed' ? 'default' : task.status === 'failed' ? 'destructive' : 'secondary'}>
            {task.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        {taskImage ? (
          <div className="aspect-video bg-muted rounded-md overflow-hidden">
            <img 
              src={taskImage} 
              alt={taskTitle}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
            <p className="text-muted-foreground text-sm">No image</p>
          </div>
        )}
        
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">
            Created {timeAgo}
          </p>
          {task.type && (
            <p className="text-sm text-muted-foreground mt-1">
              Type: {task.type}
            </p>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 flex justify-end">
        <Button 
          variant="default" 
          size="sm" 
          className="bg-[#9b87f5] hover:bg-[#7E69AB] text-white"
          asChild
        >
          <Link to={`/task/${task.id}`}>
            View details <ExternalLink className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TaskCard;
