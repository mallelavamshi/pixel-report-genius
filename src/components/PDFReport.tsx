
import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Download, Maximize } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { downloadPDF } from '@/lib/pdfGenerator';

// Set the PDF.js worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFReportProps {
  pdfUrl: string;
}

const PDFReport = ({ pdfUrl }: PDFReportProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  };

  const previousPage = () => {
    changePage(-1);
  };

  const nextPage = () => {
    changePage(1);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="bg-white rounded-lg shadow-sm border border-border p-4 mb-4 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <Button
              onClick={previousPage}
              disabled={pageNumber <= 1}
              variant="outline"
              size="sm"
              className="w-8 h-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              onClick={nextPage}
              disabled={numPages === null || pageNumber >= numPages}
              variant="outline"
              size="sm"
              className="w-8 h-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Page {pageNumber} of {numPages || '?'}
          </p>
          
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                  <Maximize className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <div className="flex justify-center p-4">
                  <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    className="max-h-[80vh] overflow-auto"
                  >
                    <Page 
                      pageNumber={pageNumber} 
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      width={580}
                    />
                  </Document>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button 
              onClick={() => downloadPDF(pdfUrl)} 
              variant="outline" 
              size="sm"
              className="w-8 h-8 p-0"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            className="max-h-[60vh] overflow-auto"
          >
            <Page 
              pageNumber={pageNumber} 
              renderTextLayer={false}
              renderAnnotationLayer={false}
              width={380}
            />
          </Document>
        </div>
      </div>
      
      <Button 
        onClick={() => downloadPDF(pdfUrl)} 
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Download PDF
      </Button>
    </div>
  );
};

export default PDFReport;
