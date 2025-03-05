
import { TaskImage } from '@/contexts/types/analysisTypes';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface AnalysisResultCardProps {
  image: TaskImage;
}

const AnalysisResultCard = ({ image }: AnalysisResultCardProps) => {
  const navigate = useNavigate();
  
  if (!image.analysisResult) {
    return (
      <Card key={image.id} className="overflow-hidden">
        <div className="aspect-video">
          <img 
            src={image.imageUrl} 
            alt={image.description || "Image"} 
            className="w-full h-full object-cover"
          />
        </div>
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">
            {image.description || "Image"}
          </h4>
          <p className="text-sm text-muted-foreground">
            No analysis results available.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-video relative group">
        <img 
          src={image.imageUrl} 
          alt={image.description || "Analysis image"} 
          className="w-full h-full object-cover"
        />
        
        {image.analysisResult.objects && image.analysisResult.objects.length > 0 && (
          <>
            {image.analysisResult.objects.map((obj, index) => (
              <div
                key={index}
                className="absolute border-2 border-primary rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  left: `${obj.boundingBox.x}%`,
                  top: `${obj.boundingBox.y}%`,
                  width: `${obj.boundingBox.width}%`,
                  height: `${obj.boundingBox.height}%`,
                }}
              >
                <span className="absolute -top-6 left-0 text-xs bg-primary text-white px-1 py-0.5 rounded">
                  {obj.name} ({(obj.confidence * 100).toFixed(0)}%)
                </span>
              </div>
            ))}
          </>
        )}
      </div>
      
      <CardContent className="p-4">
        <h4 className="font-medium mb-2">
          {image.description || "Image Analysis"}
        </h4>
        
        <div className="space-y-3">
          {image.analysisResult.tags && (
            <div className="flex flex-wrap gap-1 mb-2">
              {image.analysisResult.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {image.analysisResult.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{image.analysisResult.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {image.analysisResult.description}
          </p>
          
          <Button 
            size="sm" 
            variant="default" 
            className="w-full mt-2"
            onClick={() => navigate(`/analysis/${image.analysisResult.id}`)}
          >
            View Full Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalysisResultCard;
