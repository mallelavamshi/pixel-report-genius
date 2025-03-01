
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import { useAnalysis } from '@/contexts/AnalysisContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Grid, Image, Upload, FileText, ArrowLeft, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import EnhancedImageUploader, { ImagePreviewList } from '@/components/EnhancedImageUploader';
import { toast } from "sonner";

const Task = () => {
  const { id } = useParams<{ id: string }>();
  const { getTask, updateTask } = useAnalysis();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const task = id ? getTask(id) : undefined;

  useEffect(() => {
    if (!task) {
      toast.error("Task not found");
      navigate('/dashboard');
    }
  }, [task, navigate]);

  if (!task) {
    return null;
  }

  const handleSubmitTask = () => {
    if (task.images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate processing
    updateTask(task.id, { status: 'processing' });
    
    // In a real app, this would be an API call to start the task processing
    setTimeout(() => {
      updateTask(task.id, { 
        status: 'completed',
        completedAt: new Date()
      });
      setIsSubmitting(false);
      toast.success("Task completed successfully");
    }, 3000);
  };

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

  return (
    <div className="min-h-screen pb-16">
      <NavBar />
      
      <main className="container mx-auto px-4 pt-28">
        <div className="max-w-5xl mx-auto">
          <Button 
            variant="ghost" 
            className="mb-6"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-medium flex items-center space-x-3">
                {task.type === 'multi-lot' ? (
                  <Grid className="h-6 w-6 mr-2" />
                ) : (
                  <Image className="h-6 w-6 mr-2" />
                )}
                <span>{task.name}</span>
                <Badge className={`ml-2 ${getStatusColor(task.status)}`}>
                  {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </Badge>
              </h1>
              {task.description && (
                <p className="text-lg text-muted-foreground mt-2">
                  {task.description}
                </p>
              )}
            </div>
            
            {task.status === 'completed' && (
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            )}
          </div>
          
          {task.status === 'pending' && (
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <Upload className="h-5 w-5 mr-2" />
                    Upload Images
                  </CardTitle>
                  <CardDescription>
                    {task.type === 'multi-lot' 
                      ? 'Upload multiple images for batch processing' 
                      : 'Upload a single image for analysis'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EnhancedImageUploader taskId={task.id} />
                </CardContent>
              </Card>
            </div>
          )}
          
          <div className="mb-8">
            <ImagePreviewList taskId={task.id} />
          </div>
          
          {task.status === 'pending' && (
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmitTask}
                disabled={isSubmitting || task.images.length === 0}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? 'Processing...' : 'Submit for Analysis'}
              </Button>
            </div>
          )}
          
          {task.status === 'processing' && (
            <Card>
              <CardContent className="text-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                <h3 className="text-lg font-medium mb-2">Processing Your Images</h3>
                <p className="text-muted-foreground">
                  This may take a few minutes. You can leave this page and check back later.
                </p>
              </CardContent>
            </Card>
          )}
          
          {task.status === 'completed' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-4">
                  <p className="text-muted-foreground">
                    Your analysis is complete. Download the report or view individual image results below.
                  </p>
                </div>
                
                {/* This would be replaced with actual analysis results in a real app */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {task.images.map((image) => (
                    <Card key={image.id}>
                      <div className="aspect-video">
                        <img 
                          src={image.imageUrl} 
                          alt={image.description || "Analysis image"} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">
                          {image.description || "Image Analysis"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Analysis results would appear here in a real application.
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Task;
