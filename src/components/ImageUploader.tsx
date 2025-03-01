
import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { analyzeImage } from '@/lib/imageAnalysis';
import { useAnalysis } from '@/contexts/AnalysisContext';
import { useNavigate } from 'react-router-dom';

const ImageUploader = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { addAnalysis, setCurrentAnalysis, setIsLoading } = useAnalysis();
  const navigate = useNavigate();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Check if file is an image
    if (!file.type.match('image.*')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive"
      });
      return;
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image less than 10MB",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    simulateUpload(file);
  };

  const simulateUpload = async (file: File) => {
    setIsUploading(true);
    setProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 100);

    try {
      // After "upload" is complete, analyze the image
      setIsLoading(true);
      const analysis = await analyzeImage(URL.createObjectURL(file));
      
      // Update progress and clear the interval
      clearInterval(interval);
      setProgress(100);
      
      // Add the analysis to our context
      addAnalysis(analysis);
      setCurrentAnalysis(analysis);
      
      // Success toast
      toast({
        title: "Analysis complete!",
        description: "Your image has been analyzed successfully."
      });
      
      // Navigate to the analysis page
      setTimeout(() => {
        navigate(`/analysis/${analysis.id}`);
      }, 1000);
    } catch (error) {
      clearInterval(interval);
      console.error(error);
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your image.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    setProgress(0);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div 
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
          isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50 hover:bg-accent/30'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative">
            <button 
              onClick={clearPreview}
              className="absolute -top-4 -right-4 p-1 bg-white rounded-full shadow-sm border border-border hover:bg-accent transition-colors"
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </button>
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-auto rounded-lg max-h-64 object-contain mx-auto"
            />
            {isUploading && (
              <div className="mt-4">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  {progress < 100 ? 'Analyzing image...' : 'Analysis complete!'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-accent flex items-center justify-center mb-4">
              <ImageIcon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Upload an image</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop an image, or click to select a file
            </p>
            <Button 
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="group"
            >
              <Upload className="h-4 w-4 mr-2 group-hover:animate-bounce" />
              Select Image
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
