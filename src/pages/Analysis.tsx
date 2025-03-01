
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import ImageAnalysisResult from '@/components/ImageAnalysisResult';
import PDFReport from '@/components/PDFReport';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Layers } from 'lucide-react';
import { useAnalysis } from '@/contexts/AnalysisContext';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { generatePDF } from '@/lib/pdfGenerator';

const Analysis = () => {
  const { id } = useParams<{ id: string }>();
  const { analyses, getAnalysis, setCurrentAnalysis } = useAnalysis();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  const analysis = id ? getAnalysis(id) : null;
  
  useEffect(() => {
    // Redirect if analysis not found
    if (id && analyses.length > 0 && !analysis) {
      toast({
        title: "Analysis not found",
        description: "The requested analysis could not be found.",
        variant: "destructive"
      });
      navigate('/dashboard');
    }

    // Set as current analysis
    if (analysis) {
      setCurrentAnalysis(analysis);
      
      // Generate PDF for the PDF tab
      const generatePdfForViewing = async () => {
        try {
          const url = await generatePDF(analysis);
          setPdfUrl(url);
        } catch (error) {
          console.error('PDF generation failed:', error);
        }
      };
      
      generatePdfForViewing();
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
    
    return () => {
      setCurrentAnalysis(null);
    };
  }, [id, analyses, analysis, navigate, setCurrentAnalysis, toast]);
  
  if (!analysis) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <div className="container mx-auto px-4 pt-28">
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 bg-accent rounded-full mb-4"></div>
              <div className="h-4 w-48 bg-accent rounded mb-2"></div>
              <div className="h-4 w-64 bg-accent rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <NavBar />
      
      <main className="container mx-auto px-4 pt-28">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
            <div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="mb-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-3xl font-medium">Analysis Results</h1>
            </div>
            <div className="text-sm text-muted-foreground">
              Analysis completed on {analysis.date.toLocaleString()}
            </div>
          </div>
          
          <Separator className="mb-8" />
          
          <Tabs defaultValue="analysis" className="animate-fade-in opacity-0" style={{ animationDelay: '200ms' }}>
            <TabsList className="mb-8">
              <TabsTrigger value="analysis" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Analysis
              </TabsTrigger>
              <TabsTrigger value="pdf" className="flex items-center gap-2" disabled={!pdfUrl}>
                <FileText className="h-4 w-4" />
                PDF Report
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="analysis">
              <ImageAnalysisResult analysis={analysis} />
            </TabsContent>
            
            <TabsContent value="pdf">
              {pdfUrl ? (
                <PDFReport pdfUrl={pdfUrl} />
              ) : (
                <div className="flex justify-center py-12">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-accent rounded-full mb-4"></div>
                    <div className="h-4 w-48 bg-accent rounded mb-2"></div>
                    <div className="h-4 w-64 bg-accent rounded"></div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Analysis;
