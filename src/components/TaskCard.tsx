
import { Link } from 'react-router-dom';
import { formatDistance } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { Task } from '@/contexts/AnalysisContext';

interface TaskCardProps {
  task: Task;
}

const TaskCard = ({ task }: TaskCardProps) => {
  const timeAgo = formatDistance(new Date(task.created), new Date(), { addSuffix: true });
  
  // Use the first image as the task image if available
  const taskImage = task.images && task.images.length > 0 ? task.images[0].imageUrl : task.imageUrl;
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-0">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium truncate">
            {task.title || task.name || 'Untitled Task'}
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
              alt={task.title || 'Task image'} 
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
      
      <CardFooter className="pt-0">
        <Link 
          to={`/task/${task.id}`}
          className="text-sm text-primary flex items-center hover:underline"
        >
          View details <ExternalLink className="ml-1 h-3 w-3" />
        </Link>
      </CardFooter>
    </Card>
  );
};

export default TaskCard;
