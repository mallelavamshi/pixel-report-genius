
import { useState } from 'react';
import { 
  Camera, 
  FileText, 
  Layers, 
  Palette, 
  Tag, 
  Maximize, 
  Minimize, 
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { type AnalysisResult } from '@/contexts/AnalysisContext';
import { generatePDF, downloadPDF } from '@/lib/pdfGenerator';
import { toast } from '@/hooks/use-toast';
import { AnalysisProvider } from '@/contexts/AnalysisContext';

interface ImageAnalysisResultProps {
  analysis: AnalysisResult;
}

const ImageAnalysisResult = ({ analysis }: ImageAnalysisResultProps) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const url = await generatePDF(analysis);
      setPdfUrl(url);
      toast({
        title: "PDF Generated",
        description: "Your PDF report has been generated successfully."
      });
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast({
        title: "PDF Generation Failed",
        description: "There was an error generating your PDF report.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDownloadPDF = () => {
    if (pdfUrl) {
      downloadPDF(pdfUrl);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/2">
          <Card className="overflow-hidden h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Image Preview
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div className="relative rounded-lg overflow-hidden bg-accent/30 flex items-center justify-center p-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="absolute top-2 right-2 w-8 h-8 p-0">
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-screen-lg w-[90vw]">
                    <div className="flex items-center justify-center p-2">
                      <img
                        src={analysis.imageUrl}
                        alt="Analyzed Image"
                        className="max-w-full max-h-[80vh] object-contain rounded-lg"
                      />
                    </div>
                  </DialogContent>
                </Dialog>
                
                <img 
                  src={analysis.imageUrl} 
                  alt="Analyzed Image" 
                  className="max-w-full max-h-80 object-contain rounded-lg"
                />
              </div>
              
              <div className="mt-6">
                <h3 className="text-md font-medium mb-2 flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.tags.map((tag, index) => (
                    <div 
                      key={index} 
                      className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm"
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-md font-medium mb-2">Description</h3>
                <p className="text-muted-foreground">{analysis.description}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:w-1/2">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Analysis Results
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <Tabs defaultValue="objects">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="objects" className="flex-1">Objects</TabsTrigger>
                  <TabsTrigger value="colors" className="flex-1">Colors</TabsTrigger>
                </TabsList>
                
                <TabsContent value="objects">
                  <div className="space-y-4">
                    {analysis.objects.map((object, index) => (
                      <div 
                        key={index} 
                        className="p-3 rounded-lg border border-border/60 bg-accent/10"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{object.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {(object.confidence * 100).toFixed(1)}% confidence
                          </span>
                        </div>
                        <div className="w-full bg-accent/50 rounded-full h-2.5">
                          <div 
                            className="bg-primary h-2.5 rounded-full" 
                            style={{ width: `${object.confidence * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="colors">
                  <div className="space-y-4">
                    {analysis.colors.map((color, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-md shadow-sm border border-border/60" 
                          style={{ backgroundColor: color.color }}
                        ></div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">{color.color}</span>
                            <span className="text-sm text-muted-foreground">
                              {color.percentage}%
                            </span>
                          </div>
                          <div className="w-full bg-accent/50 rounded-full h-2.5">
                            <div 
                              className="bg-primary h-2.5 rounded-full" 
                              style={{ width: `${color.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="mt-8">
                <h3 className="text-md font-medium mb-4 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  PDF Report
                </h3>
                <div className="flex gap-3">
                  <Button
                    onClick={handleGeneratePDF}
                    disabled={isGeneratingPDF}
                    className="flex-1"
                  >
                    {isGeneratingPDF ? 'Generating...' : 'Generate PDF'}
                  </Button>
                  <Button
                    onClick={handleDownloadPDF}
                    disabled={!pdfUrl}
                    variant="outline"
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" /> Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ImageAnalysisResult;
