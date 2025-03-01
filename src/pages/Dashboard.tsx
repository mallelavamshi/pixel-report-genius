
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import ImageUploader from '@/components/ImageUploader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAnalysis } from '@/contexts/AnalysisContext';
import { Calendar, Clock, FileText, Upload } from 'lucide-react';

const Dashboard = () => {
  const { analyses, isLoading } = useAnalysis();
  const navigate = useNavigate();

  // Format date to readable string
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Format time to readable string
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  return (
    <div className="min-h-screen pb-16">
      <NavBar />
      
      <main className="container mx-auto px-4 pt-28">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl font-medium mb-4">Image Analysis Dashboard</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload an image to get started with AI-powered analysis and generate detailed reports.
            </p>
          </div>
          
          <div className="mb-12 animate-fade-in opacity-0" style={{ animationDelay: '200ms' }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-medium">
                  <Upload className="inline-block mr-2 h-5 w-5" />
                  Upload Image
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ImageUploader />
              </CardContent>
            </Card>
          </div>
          
          {analyses.length > 0 && (
            <div className="animate-fade-in opacity-0" style={{ animationDelay: '400ms' }}>
              <h2 className="text-2xl font-medium mb-6">Recent Analyses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analyses.map((analysis, index) => (
                  <Card 
                    key={analysis.id}
                    className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/analysis/${analysis.id}`)}
                  >
                    <div className="aspect-video relative">
                      <img 
                        src={analysis.imageUrl} 
                        alt={`Analysis ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent">
                        <div className="absolute bottom-3 left-3">
                          <div className="flex items-center gap-1 text-white text-xs">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(analysis.date)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-white text-xs">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(analysis.date)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-sm font-medium">Analysis Report</div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <FileText className="h-3 w-3 mr-1" />
                          {analysis.objects.length} objects
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {analysis.tags.slice(0, 3).map((tag, tagIndex) => (
                          <div 
                            key={tagIndex} 
                            className="px-2 py-0.5 bg-accent text-accent-foreground rounded-full text-xs"
                          >
                            {tag}
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {analyses.length === 0 && !isLoading && (
            <div className="text-center py-12 animate-fade-in opacity-0" style={{ animationDelay: '400ms' }}>
              <div className="mb-4 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-medium mb-2">No analyses yet</h3>
                <p className="max-w-md mx-auto">
                  Upload your first image to start analyzing and get detailed insights.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
