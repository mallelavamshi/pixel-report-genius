import { useState, useRef } from 'react';
import { Camera, Upload, X, Image as ImageIcon, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from "sonner";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAnalysis, TaskImage } from '@/contexts/AnalysisContext';

type UploadMethod = 'camera' | 'gallery' | null;

const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

type EnhancedImageUploaderProps = {
  taskId: string;
  onUploadComplete?: () => void;
};

const EnhancedImageUploader = ({ taskId, onUploadComplete }: EnhancedImageUploaderProps) => {
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showDescriptionDialog, setShowDescriptionDialog] = useState(false);
  const [imageDescription, setImageDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const { addImageToTask, getTask } = useAnalysis();
  const [tempImageFile, setTempImageFile] = useState<File | null>(null);

  const task = getTask(taskId);

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

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.match('image.*')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive"
      });
      return;
    }

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
    setTempImageFile(file);
    setShowDescriptionDialog(true);
  };

  const handleUploadWithDescription = () => {
    if (!tempImageFile) return;
    
    setShowDescriptionDialog(false);
    simulateUpload(tempImageFile, imageDescription);
  };

  const simulateUpload = async (file: File, description?: string) => {
    setIsUploading(true);
    setProgress(0);
    
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
      setTimeout(() => {
        clearInterval(interval);
        setProgress(100);
        
        const newImage: TaskImage = {
          id: generateId(),
          imageUrl: URL.createObjectURL(file),
          description: description,
          uploadedAt: new Date(),
        };
        
        addImageToTask(taskId, newImage);
        
        sonnerToast.success("Image uploaded successfully");
        
        setTimeout(() => {
          setPreview(null);
          setProgress(0);
          setIsUploading(false);
          setUploadMethod(null);
          setImageDescription('');
          setTempImageFile(null);
          
          if (onUploadComplete) {
            onUploadComplete();
          }
        }, 1000);
      }, 1500);
    } catch (error) {
      clearInterval(interval);
      console.error(error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your image.",
        variant: "destructive"
      });
      setIsUploading(false);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    setProgress(0);
    setIsUploading(false);
    setImageDescription('');
    setTempImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  if (!task) {
    return <div>Task not found</div>;
  }

  if (uploadMethod === null) {
    return (
      <div className="w-full space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button 
            className="h-32 flex flex-col gap-2"
            variant="outline"
            onClick={() => setUploadMethod('camera')}
          >
            <Camera className="h-8 w-8" />
            <span>Take a Photo</span>
          </Button>
          
          <Button 
            className="h-32 flex flex-col gap-2"
            variant="outline"
            onClick={() => setUploadMethod('gallery')}
          >
            <Upload className="h-8 w-8" />
            <span>Upload from Gallery</span>
          </Button>
        </div>
      </div>
    );
  }

  if (uploadMethod === 'camera') {
    return (
      <div className="w-full space-y-4">
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
                  {progress < 100 ? 'Uploading image...' : 'Upload complete!'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-4">
              <Camera className="h-12 w-12 mx-auto mb-2 text-primary" />
              <h3 className="text-lg font-medium">Take a Photo</h3>
              <p className="text-sm text-muted-foreground">
                Use your device camera to take a photo
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={cameraInputRef}
              onChange={handleCameraCapture}
              className="hidden"
            />
            <Button 
              onClick={() => cameraInputRef.current?.click()}
              className="mb-2"
            >
              <Camera className="h-4 w-4 mr-2" />
              Capture Photo
            </Button>
            <div>
              <Button 
                variant="ghost" 
                onClick={() => setUploadMethod(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (uploadMethod === 'gallery') {
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
                    {progress < 100 ? 'Uploading image...' : 'Upload complete!'}
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
                className="group mb-2"
              >
                <Upload className="h-4 w-4 mr-2 group-hover:animate-bounce" />
                Select Image
              </Button>
              <div>
                <Button 
                  variant="ghost" 
                  onClick={() => setUploadMethod(null)}
                >
                  Cancel
                </Button>
              </div>
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
  }

  return null;
}

export default EnhancedImageUploader;

export const ImagePreviewList = ({ taskId, onDelete }: { taskId: string, onDelete?: (imageId: string) => void }) => {
  const { getTask, removeImageFromTask } = useAnalysis();
  const task = getTask(taskId);

  const handleDeleteImage = (imageId: string) => {
    if (window.confirm("Are you sure you want to delete this image?")) {
      removeImageFromTask(taskId, imageId);
      if (onDelete) {
        onDelete(imageId);
      }
      sonnerToast.success("Image removed");
    }
  };

  if (!task) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Uploaded Images ({task.images.length})</h3>
      
      {task.images.length === 0 ? (
        <div className="text-center p-4 border border-dashed rounded-lg">
          <p className="text-sm text-muted-foreground">No images uploaded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {task.images.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <div className="aspect-square relative">
                <img 
                  src={image.imageUrl} 
                  alt={image.description || "Uploaded image"} 
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 bg-white/80 hover:bg-red-50 text-red-600"
                  onClick={() => handleDeleteImage(image.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground truncate">
                  {image.description || "No description"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(image.uploadedAt).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export const DescriptionDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  description, 
  setDescription 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  description: string; 
  setDescription: (value: string) => void; 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Image Description</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Textarea
            placeholder="Enter an optional description for this image"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Skip
          </Button>
          <Button onClick={onConfirm}>
            Add & Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
