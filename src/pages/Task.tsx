
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import { useAnalysis } from '@/contexts/AnalysisContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileIcon, Image, Upload, FileText, ArrowLeft, Download, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import EnhancedImageUploader, { ImagePreviewList } from '@/components/EnhancedImageUploader';
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { generatePDF, downloadPDF } from '@/lib/pdfGenerator';

const Task = () => {
  const { id } = useParams<{ id: string }>();
  const { getTask, updateTask } = useAnalysis();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("images");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

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

  const handleUploadComplete = () => {
    // This function is called after each successful upload
    // For multi-lot tasks, we want to allow continued uploads
    toast.success(`Image added to ${task.name}. You can add more images.`);
  };

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
      // Simulate creating analysis results for each image
      const updatedImages = task.images.map(image => {
        return {
          ...image,
          analysisResult: {
            id: Math.random().toString(36).substring(2, 15),
            imageUrl: image.imageUrl,
            date: new Date(),
            objects: [
              { 
                name: "Object 1", 
                confidence: 0.95, 
                boundingBox: { x: 10, y: 10, width: 100, height: 100 } 
              },
              { 
                name: "Object 2", 
                confidence: 0.87, 
                boundingBox: { x: 150, y: 150, width: 80, height: 80 } 
              }
            ],
            colors: [
              { color: "#ff5733", percentage: 35 },
              { color: "#33ff57", percentage: 25 },
              { color: "#3357ff", percentage: 40 }
            ],
            tags: ["tag1", "tag2", "tag3"],
            description: "AI-generated description of the image content.",
          }
        };
      });
      
      updateTask(task.id, { 
        status: 'completed',
        completedAt: new Date(),
        images: updatedImages
      });
      
      setIsSubmitting(false);
      toast.success("Task completed successfully");
    }, 3000);
  };

  const handleGenerateReport = async () => {
    if (!task || task.images.length === 0) {
      toast.error("No images to generate report from");
      return;
    }
    
    setIsGeneratingReport(true);
    
    try {
      // For this demo, we'll just use the first image's analysis result
      // In a real app, we'd create a comprehensive report for all images
      const firstImageWithAnalysis = task.images.find(img => img.analysisResult);
      
      if (!firstImageWithAnalysis || !firstImageWithAnalysis.analysisResult) {
        toast.error("No analysis results available");
        setIsGeneratingReport(false);
        return;
      }
      
      const pdfUrl = await generatePDF(firstImageWithAnalysis.analysisResult);
      setReportUrl(pdfUrl);
      toast.success("Report generated successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate report");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleDownloadReport = () => {
    if (reportUrl) {
      downloadPDF(reportUrl, `${task.name.replace(/\s+/g, '-').toLowerCase()}-report.pdf`);
    } else {
      handleGenerateReport().then(() => {
        if (reportUrl) {
          downloadPDF(reportUrl, `${task.name.replace(/\s+/g, '-').toLowerCase()}-report.pdf`);
        }
      });
    }
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
                  <FileIcon className="h-6 w-6 mr-2" />
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
              <Button onClick={handleDownloadReport}>
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
                  <EnhancedImageUploader 
                    taskId={task.id} 
                    onUploadComplete={handleUploadComplete}
                  />
                </CardContent>
              </Card>
            </div>
          )}
          
          {(task.status === 'pending' || task.status === 'completed') && (
            <div className="mb-8">
              <ImagePreviewList taskId={task.id} />
            </div>
          )}
          
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
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="images">
                      <Image className="h-4 w-4 mr-2" />
                      Images
                    </TabsTrigger>
                    <TabsTrigger value="summary">
                      <Zap className="h-4 w-4 mr-2" />
                      Summary
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="images">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      {task.images.map((image) => (
                        <Card key={image.id} className="overflow-hidden">
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
                            {image.analysisResult ? (
                              <div className="space-y-2">
                                <p className="text-sm">
                                  <span className="font-medium">Objects:</span>{' '}
                                  {image.analysisResult.objects.map(obj => obj.name).join(', ')}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">Tags:</span>{' '}
                                  {image.analysisResult.tags.join(', ')}
                                </p>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => navigate(`/analysis/${image.analysisResult?.id}`)}
                                >
                                  View Detailed Analysis
                                </Button>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                No analysis results available.
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="summary">
                    <div className="space-y-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Task Summary</h3>
                            <Badge className={getStatusColor(task.status)}>
                              {task.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Task Type</p>
                              <p className="font-medium">{task.type === 'multi-lot' ? 'Multi-Lot Analysis' : 'Single-Lot Analysis'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Created</p>
                              <p className="font-medium">{new Date(task.createdAt).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Completed</p>
                              <p className="font-medium">{task.completedAt ? new Date(task.completedAt).toLocaleString() : 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Images</p>
                              <p className="font-medium">{task.images.length}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <div className="flex justify-end">
                        <Button
                          onClick={handleGenerateReport}
                          disabled={isGeneratingReport}
                        >
                          {isGeneratingReport ? 'Generating...' : 'Generate PDF Report'}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Task;
