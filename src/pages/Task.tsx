import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import { useAnalysis } from '@/contexts/AnalysisContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { 
  FileIcon, 
  Image, 
  Upload, 
  FileText, 
  ArrowLeft, 
  Download, 
  Zap, 
  Settings, 
  FileSpreadsheet, 
  Camera,
  Plus
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import EnhancedImageUploader, { ImagePreviewList } from '@/components/EnhancedImageUploader';
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { generatePDF, downloadPDF, generateTaskPDF } from '@/lib/pdfGenerator';
import { generateExcel, downloadExcel, generateTaskExcel } from '@/lib/excelGenerator';
import ApiKeyManager, { useApiKeys } from '@/components/ApiKeyManager';
import { uploadImageToImgBB, urlToFile, resizeImage, blobUrlToDataUrl } from '@/services/imgbbService';
import { searchSimilarProducts } from '@/services/searchApiService';
import { analyzeImageWithClaude } from '@/services/anthropicService';
import { v4 as uuidv4 } from 'uuid';
import { 
  Dialog, 
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle 
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CustomNavBar from '@/components/CustomNavBar';

const Task = () => {
  const { id } = useParams<{ id: string }>();
  const { getTask, updateTask } = useAnalysis();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [excelUrl, setExcelUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("images");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isApiKeysDialogOpen, setIsApiKeysDialogOpen] = useState(false);
  const { apiKeys } = useApiKeys();
  
  const [showUploadMethodDialog, setShowUploadMethodDialog] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'camera' | 'gallery' | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDescription, setImageDescription] = useState('');
  const [showDescriptionDialog, setShowDescriptionDialog] = useState(false);
  
  const [showResultsTable, setShowResultsTable] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<Record<string, string>>({});

  const task = id ? getTask(id) : undefined;

  const areApiKeysConfigured = () => {
    return !!(apiKeys.imgbb && apiKeys.searchApi && apiKeys.anthropic);
  };

  useEffect(() => {
    if (!task) {
      toast.error("Task not found");
      navigate('/dashboard');
    } else if (!areApiKeysConfigured() && task.status === 'pending' && task.images.length > 0) {
      toast("Please configure your API keys before analysis", {
        description: "Click the settings button to enter your API keys.",
        action: {
          label: "Configure",
          onClick: () => setIsApiKeysDialogOpen(true)
        }
      });
    }
  }, [task, navigate]);

  const handleCameraCapture = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        setImageFile(file);
        
        const reader = new FileReader();
        reader.onload = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        
        setShowUploadMethodDialog(false);
        setShowDescriptionDialog(true);
      }
    };
    
    input.click();
  }, []);

  const handleGalleryUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        setImageFile(file);
        
        const reader = new FileReader();
        reader.onload = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        
        setShowUploadMethodDialog(false);
        setShowDescriptionDialog(true);
      }
    };
    
    input.click();
  }, []);

  const handleAddImageWithDescription = useCallback(() => {
    if (!task || !imageFile || !imagePreview) return;
    
    const newImage = {
      id: uuidv4(),
      imageUrl: imagePreview,
      description: imageDescription,
      uploadedAt: new Date(),
    };
    
    updateTask(task.id, {
      images: [...task.images, newImage]
    });
    
    setImageFile(null);
    setImagePreview(null);
    setImageDescription('');
    setShowDescriptionDialog(false);
    
    toast.success("Image added successfully");
  }, [task, imageFile, imagePreview, imageDescription, updateTask]);

  const handleSkipDescription = useCallback(() => {
    if (!task || !imageFile || !imagePreview) return;
    
    const newImage = {
      id: uuidv4(),
      imageUrl: imagePreview,
      description: '',
      uploadedAt: new Date(),
    };
    
    updateTask(task.id, {
      images: [...task.images, newImage]
    });
    
    setImageFile(null);
    setImagePreview(null);
    setImageDescription('');
    setShowDescriptionDialog(false);
    
    toast.success("Image added successfully");
  }, [task, imageFile, imagePreview, updateTask]);

  const processImage = async (imageUrl: string, imageDescription?: string) => {
    try {
      console.log("Processing image:", { imageUrl, imageDescription });
      
      // Upload to ImgBB
      console.log("Uploading to ImgBB");
      // Pass the URL directly to uploadImageToImgBB - we fixed the function to handle URLs
      const imgbbUrl = await uploadImageToImgBB(imageUrl, apiKeys.imgbb);
      if (!imgbbUrl) throw new Error("Failed to upload image to ImgBB");
      console.log("Image uploaded successfully to ImgBB:", imgbbUrl);
      
      // Search for similar products
      console.log("Searching similar products with SearchAPI");
      const searchQuery = imageDescription || "eBay Etsy collectible";
      const searchResults = await searchSimilarProducts(
        imgbbUrl, 
        apiKeys.searchApi, 
        searchQuery
      );
      console.log("Search results:", searchResults.length, "items found");
      
      // Analyze with Claude
      console.log("Analyzing with Claude");
      let claudeAnalysis;
      try {
        claudeAnalysis = await analyzeImageWithClaude(imgbbUrl, searchResults, apiKeys.anthropic);
        console.log("Claude analysis completed");
      } catch (error) {
        console.error("Error with Claude analysis:", error);
        claudeAnalysis = "Error performing AI analysis. Please try again later.";
      }
      
      // Create mock objects and colors (these would normally come from an image analysis service)
      const mockObjects = [
        { 
          name: imageDescription || "Analyzed Object", 
          confidence: 0.95, 
          boundingBox: { x: 10, y: 10, width: 80, height: 80 } 
        }
      ];
      
      const mockColors = [
        { color: "#ff5733", percentage: 35 },
        { color: "#33ff57", percentage: 25 },
        { color: "#3357ff", percentage: 40 }
      ];
      
      return {
        id: uuidv4(),
        imageUrl: imgbbUrl,
        date: new Date(),
        objects: mockObjects,
        colors: mockColors,
        tags: ["analyzed", "collectible", "appraised"],
        description: imageDescription || "Analyzed collectible item",
        searchResults,
        claudeAnalysis
      };
    } catch (error: any) {
      console.error("Error processing image:", error);
      throw new Error(`Failed to process image: ${error.message}`);
    }
  };

  const handleSubmitTask = async () => {
    if (!task || task.images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }
  
    if (!areApiKeysConfigured()) {
      toast.error("Please configure your API keys first");
      setIsApiKeysDialogOpen(true);
      return;
    }
  
    setIsSubmitting(true);
    setShowResultsTable(true);
    
    updateTask(task.id, { status: 'processing' });
    
    try {
      const updatedImages = [...task.images];
      const newProcessingStatus: Record<string, string> = {};
      
      // Process each image one by one
      for (let i = 0; i < updatedImages.length; i++) {
        const image = updatedImages[i];
        
        if (image.analysisResult) {
          console.log(`Image ${i} already has analysis results, skipping`);
          continue;
        }
        
        try {
          newProcessingStatus[image.id] = `Processing image ${i+1} of ${updatedImages.length}`;
          setProcessingStatus(prev => ({ ...prev, [image.id]: newProcessingStatus[image.id] }));
          
          console.log(`Processing image ${i+1}/${updatedImages.length}:`, image.imageUrl);
          const analysisResult = await processImage(image.imageUrl, image.description);
          
          updatedImages[i] = {
            ...image,
            analysisResult
          };
          
          newProcessingStatus[image.id] = `Completed`;
          setProcessingStatus(prev => ({ ...prev, [image.id]: newProcessingStatus[image.id] }));
          
          // Update the task after each image is processed
          updateTask(task.id, { 
            images: updatedImages
          });
          
          console.log("Updated image with analysis result");
          
        } catch (error: any) {
          console.error(`Error processing image ${i}:`, error);
          newProcessingStatus[image.id] = `Failed: ${error.message}`;
          setProcessingStatus(prev => ({ ...prev, [image.id]: newProcessingStatus[image.id] }));
        }
      }
      
      const anySuccessful = updatedImages.some(img => img.analysisResult);
      
      // Update task status
      updateTask(task.id, { 
        status: anySuccessful ? 'completed' : 'failed',
        completedAt: new Date(),
        images: updatedImages
      });
      
      if (anySuccessful) {
        toast.success("Task completed successfully");
        
        if (task.type === 'single-lot' && updatedImages.length > 0) {
          setActiveTab("results");
        }
        
        await handleGenerateReports();
      } else {
        toast.error("Failed to process any images");
      }
      
    } catch (error: any) {
      console.error("Error processing task:", error);
      toast.error(`Failed to process task: ${error.message}`);
      updateTask(task.id, { status: 'failed' });
    } finally {
      setIsSubmitting(false);
    }
  }; 

  const handleGenerateReports = async () => {
    if (!task || task.images.length === 0) {
      toast.error("No images to generate reports from");
      return;
    }
    
    setIsGeneratingReport(true);
    
    try {
      const pdfUrl = await generateTaskPDF(task);
      setPdfUrl(pdfUrl);
      
      const excelUrl = generateTaskExcel(task);
      setExcelUrl(excelUrl);
      
      toast.success("Reports generated successfully");
    } catch (error) {
      console.error("Error generating reports:", error);
      toast.error("Failed to generate reports");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleDownloadPdf = () => {
    if (pdfUrl) {
      downloadPDF(pdfUrl, `${task?.name.replace(/\s+/g, '-').toLowerCase()}-report.pdf`);
    } else {
      handleGenerateReports().then(() => {
        if (pdfUrl) {
          downloadPDF(pdfUrl, `${task?.name.replace(/\s+/g, '-').toLowerCase()}-report.pdf`);
        }
      });
    }
  };

  const handleDownloadExcel = () => {
    if (excelUrl) {
      downloadExcel(excelUrl, `${task?.name.replace(/\s+/g, '-').toLowerCase()}-report.xlsx`);
    } else {
      handleGenerateReports().then(() => {
        if (excelUrl) {
          downloadExcel(excelUrl, `${task?.name.replace(/\s+/g, '-').toLowerCase()}-report.xlsx`);
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

  if (!task) {
    return null;
  }

  return (
    <div className="min-h-screen pb-16">
      <CustomNavBar />
      
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
            
            <div className="flex gap-2">
              {task.status === 'completed' && (
                <>
                  <Button onClick={handleDownloadPdf}>
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button onClick={handleDownloadExcel}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                </>
              )}
              <Button 
                variant="outline" 
                onClick={() => setIsApiKeysDialogOpen(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                API Keys
              </Button>
            </div>
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
                  <Button 
                    size="lg" 
                    className="w-full py-8 text-lg"
                    onClick={() => setShowUploadMethodDialog(true)}
                  >
                    <Plus className="h-6 w-6 mr-2" />
                    Add Image
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
          
          {task.images.length > 0 && (
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Uploaded Images ({task.images.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {task.images.map((image) => (
                      <Card key={image.id} className="overflow-hidden">
                        <div className="aspect-square relative">
                          <img 
                            src={image.imageUrl} 
                            alt={image.description || "Uploaded image"} 
                            className="w-full h-full object-cover"
                          />
                          {processingStatus[image.id] && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                              <div className="text-white text-center p-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mx-auto mb-2"></div>
                                <p className="text-sm">{processingStatus[image.id]}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-3">
                          <p className="text-sm font-medium truncate">
                            {image.description || "No description"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(image.uploadedAt).toLocaleString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
                {task.status === 'pending' && (
                  <CardFooter className="flex justify-end">
                    <Button 
                      onClick={handleSubmitTask}
                      disabled={isSubmitting || task.images.length === 0}
                    >
                      {isSubmitting ? 'Processing...' : 'Submit for Analysis'}
                    </Button>
                  </CardFooter>
                )}
              </Card>
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
                    <TabsTrigger value="results">
                      <Zap className="h-4 w-4 mr-2" />
                      Results
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
                                {image.analysisResult.searchResults && (
                                  <p className="text-sm">
                                    <span className="font-medium">Similar Products:</span>{' '}
                                    {image.analysisResult.searchResults.length} found
                                  </p>
                                )}
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
                  
                  <TabsContent value="results">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Analysis Results</h3>
                        <Button variant="outline" onClick={() => setShowResultsTable(!showResultsTable)}>
                          {showResultsTable ? 'Hide Table' : 'Show Table'}
                        </Button>
                      </div>
                      
                      {showResultsTable && (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[200px]">Image</TableHead>
                                <TableHead>Analysis</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {task.images.map((image) => (
                                <TableRow key={image.id}>
                                  <TableCell>
                                    <div className="w-[200px] h-[200px] flex items-center justify-center">
                                      <img 
                                        src={image.imageUrl} 
                                        alt={image.description || "Analysis image"} 
                                        className="max-w-[200px] max-h-[200px] object-contain"
                                      />
                                    </div>
                                  </TableCell>
                                  <TableCell className="whitespace-pre-wrap">
                                    {image.analysisResult?.claudeAnalysis ? (
                                      <div className="text-sm max-w-[600px]">
                                        {image.analysisResult.claudeAnalysis.substring(0, 500)}...
                                      </div>
                                    ) : (
                                      <div className="text-sm text-muted-foreground">No analysis available</div>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                      
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={handleGenerateReports}
                          disabled={isGeneratingReport}
                        >
                          {isGeneratingReport ? 'Generating...' : 'Generate Reports'}
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
      
      <Dialog open={showUploadMethodDialog} onOpenChange={setShowUploadMethodDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Upload Method</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button 
              onClick={handleCameraCapture} 
              size="lg" 
              className="h-32 flex flex-col items-center justify-center"
            >
              <Camera className="h-10 w-10 mb-2" />
              <span>Take Photo</span>
            </Button>
            <Button 
              onClick={handleGalleryUpload} 
              size="lg" 
              className="h-32 flex flex-col items-center justify-center"
            >
              <Image className="h-10 w-10 mb-2" />
              <span>Choose from Gallery</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showDescriptionDialog} onOpenChange={setShowDescriptionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Image Description</DialogTitle>
            <DialogDescription>
              You can add an optional description for this image.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {imagePreview && (
              <div className="mb-4 flex justify-center">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-h-40 object-contain rounded-md"
                />
              </div>
            )}
            <Textarea
              value={imageDescription}
              onChange={(e) => setImageDescription(e.target.value)}
              placeholder="Enter an optional description for this image"
              className="w-full"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleSkipDescription}>Skip</Button>
            <Button onClick={handleAddImageWithDescription}>Add & Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <ApiKeyManager 
        open={isApiKeysDialogOpen} 
        onOpenChange={setIsApiKeysDialogOpen} 
      />
    </div>
  );
};

export default Task;
