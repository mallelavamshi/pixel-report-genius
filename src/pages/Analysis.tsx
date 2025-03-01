
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import { useAnalysis } from '@/contexts/AnalysisContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Download, Image as ImageIcon, Tag, Palette, FileText, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { generatePDF, downloadPDF } from '@/lib/pdfGenerator';
import { toast } from 'sonner';

const Analysis = () => {
  const { id } = useParams<{ id: string }>();
  const { getAnalysis } = useAnalysis();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const analysis = id ? getAnalysis(id) : undefined;

  useEffect(() => {
    if (!analysis) {
      toast.error("Analysis not found");
      navigate('/dashboard');
    }
  }, [analysis, navigate]);

  if (!analysis) {
    return null;
  }

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    
    try {
      const pdfUrl = await generatePDF(analysis);
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
      downloadPDF(reportUrl, `analysis-report-${id}.pdf`);
    } else {
      handleGenerateReport().then(() => {
        if (reportUrl) {
          downloadPDF(reportUrl, `analysis-report-${id}.pdf`);
        }
      });
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
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-medium">Image Analysis Details</h1>
              <p className="text-muted-foreground mt-2">
                Comprehensive analysis of your image
              </p>
            </div>
            
            <Button onClick={handleDownloadReport}>
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-1">
              <Card className="overflow-hidden h-full">
                <div className="aspect-square">
                  <img 
                    src={analysis.imageUrl} 
                    alt="Analysis subject" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Analysis Overview</CardTitle>
                  <CardDescription>
                    Analysis performed on {new Date(analysis.date).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                      <p>{analysis.description}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Objects Detected</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {analysis.objects.map((obj, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span>{obj.name}</span>
                            <Badge variant="outline">{(obj.confidence * 100).toFixed(0)}%</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="overview">
                    <Eye className="h-4 w-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="objects">
                    <Tag className="h-4 w-4 mr-2" />
                    Objects
                  </TabsTrigger>
                  <TabsTrigger value="colors">
                    <Palette className="h-4 w-4 mr-2" />
                    Colors
                  </TabsTrigger>
                  {analysis.claudeAnalysis && (
                    <TabsTrigger value="claude">
                      <FileText className="h-4 w-4 mr-2" />
                      AI Analysis
                    </TabsTrigger>
                  )}
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Image Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        {analysis.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Key Features</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {analysis.objects.slice(0, 5).map((obj, index) => (
                              <li key={index}>
                                {obj.name} ({(obj.confidence * 100).toFixed(0)}% confidence)
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Color Distribution</h4>
                          <div className="space-y-2">
                            {analysis.colors.map((color, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <div 
                                  className="h-4 w-4 rounded-sm" 
                                  style={{ backgroundColor: color.color }}
                                />
                                <span className="text-sm">{color.color}</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-primary h-2 rounded-full" 
                                    style={{ width: `${color.percentage}%` }}
                                  />
                                </div>
                                <span className="text-xs">{color.percentage}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="objects" className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {analysis.objects.map((obj, index) => (
                      <Card key={index} className="overflow-hidden">
                        <div className="relative aspect-video bg-accent">
                          <img 
                            src={analysis.imageUrl} 
                            alt={obj.name} 
                            className="w-full h-full object-cover"
                          />
                          <div
                            className="absolute border-2 border-primary rounded-md"
                            style={{
                              left: `${obj.boundingBox.x}%`,
                              top: `${obj.boundingBox.y}%`,
                              width: `${obj.boundingBox.width}%`,
                              height: `${obj.boundingBox.height}%`,
                            }}
                          />
                        </div>
                        <CardContent className="p-3">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">{obj.name}</h4>
                            <Badge>{(obj.confidence * 100).toFixed(0)}%</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="colors" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Color Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-4 mb-6">
                        {analysis.colors.map((color, index) => (
                          <div 
                            key={index} 
                            className="rounded-md overflow-hidden shadow-sm flex flex-col"
                            style={{ width: '80px' }}
                          >
                            <div 
                              className="h-20 w-full" 
                              style={{ backgroundColor: color.color }}
                            />
                            <div className="p-2 text-center bg-card">
                              <p className="text-xs font-mono">{color.color}</p>
                              <p className="text-xs font-medium">{color.percentage}%</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-3">Color Distribution</h4>
                        <div className="h-8 w-full flex rounded-md overflow-hidden">
                          {analysis.colors.map((color, index) => (
                            <div 
                              key={index}
                              style={{ 
                                backgroundColor: color.color,
                                width: `${color.percentage}%` 
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {analysis.claudeAnalysis && (
                  <TabsContent value="claude" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">AI-Powered Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose max-w-none">
                          <p>{analysis.claudeAnalysis}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Analysis;
