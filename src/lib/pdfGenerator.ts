
import { AnalysisResult, Task } from '@/contexts/AnalysisContext';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { resizeImage } from '@/services/imgbbService';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generatePDF = async (analysis: AnalysisResult): Promise<string> => {
  // A4 size in mm: 210 x 297
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Add title
  doc.setFontSize(22);
  doc.text('Image Analysis Report', 105, 20, { align: 'center' });
  
  // Add date
  doc.setFontSize(12);
  doc.text(`Generated: ${analysis.date.toLocaleString()}`, 105, 30, { align: 'center' });
  
  // Add image
  try {
    // Resize image while maintaining aspect ratio
    console.log("Adding image to PDF:", analysis.imageUrl);
    const resizedImageUrl = await resizeImage(analysis.imageUrl, 200, 200);
    
    // Add the resized image
    doc.addImage(resizedImageUrl, 'JPEG', 15, 40, 50, 50);
  } catch (error) {
    console.error('Error adding image to PDF:', error);
    doc.text('Image preview not available', 105, 70, { align: 'center' });
  }
  
  // Add description
  doc.setFontSize(14);
  doc.text('Description:', 15, 100);
  doc.setFontSize(12);
  
  const description = analysis.description;
  const splitDescription = doc.splitTextToSize(description, 180);
  doc.text(splitDescription, 15, 110);
  
  // Add tags
  doc.setFontSize(14);
  doc.text('Tags:', 15, 130);
  doc.setFontSize(12);
  doc.text(analysis.tags.join(', '), 15, 140);
  
  // Add detected objects table
  doc.setFontSize(14);
  doc.text('Detected Objects:', 15, 160);
  
  doc.autoTable({
    startY: 170,
    head: [['Object', 'Confidence']],
    body: analysis.objects.map(obj => [
      obj.name,
      `${(obj.confidence * 100).toFixed(2)}%`
    ]),
  });
  
  // Add color analysis
  let currentY = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(14);
  doc.text('Color Analysis:', 15, currentY);
  
  analysis.colors.forEach((color, index) => {
    const yPos = currentY + 10 + (index * 10);
    
    // Color box
    doc.setFillColor(color.color);
    doc.rect(15, yPos - 7, 10, 10, 'F');
    
    // Color info
    doc.setFontSize(12);
    doc.text(`${color.color} (${color.percentage}%)`, 30, yPos);
  });
  
  // Add Claude Analysis if available
  if (analysis.claudeAnalysis) {
    // Add a new page for Claude analysis
    doc.addPage();
    
    doc.setFontSize(18);
    doc.text('AI Analysis by Claude', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    const claudeText = analysis.claudeAnalysis;
    const splitClaudeText = doc.splitTextToSize(claudeText, 180);
    doc.text(splitClaudeText, 15, 40);
  }
  
  // Add Search Results if available
  if (analysis.searchResults && analysis.searchResults.length > 0) {
    // Add a new page for search results
    doc.addPage();
    
    doc.setFontSize(18);
    doc.text('Similar Products Found Online', 105, 20, { align: 'center' });
    
    doc.autoTable({
      startY: 30,
      head: [['Product', 'Source', 'Price']],
      body: analysis.searchResults.map(result => [
        result.title,
        result.source,
        result.price || 'N/A'
      ]),
    });
  }
  
  // Save the PDF
  return URL.createObjectURL(doc.output('blob'));
};

export const generateTaskPDF = async (task: Task): Promise<string> => {
  // A4 size in mm: 210 x 297
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Add title
  doc.setFontSize(22);
  doc.text(`Task Report: ${task.name}`, 105, 20, { align: 'center' });
  
  // Add task info
  doc.setFontSize(14);
  doc.text('Task Information', 15, 40);
  
  doc.setFontSize(12);
  doc.text(`Type: ${task.type === 'multi-lot' ? 'Multi-Lot Analysis' : 'Single-Lot Analysis'}`, 15, 50);
  doc.text(`Created: ${task.createdAt.toLocaleString()}`, 15, 60);
  doc.text(`Status: ${task.status}`, 15, 70);
  if (task.completedAt) {
    doc.text(`Completed: ${task.completedAt.toLocaleString()}`, 15, 80);
  }
  
  // Add a simple table for images and their analysis
  if (task.images.length > 0) {
    // Add image table
    doc.addPage();
    doc.setFontSize(18);
    doc.text('Analysis Results', 105, 20, { align: 'center' });
    
    // Create table
    doc.autoTable({
      startY: 30,
      theme: 'grid',
      headStyles: { fillColor: [100, 100, 100], textColor: [255, 255, 255] },
      head: [['Image', 'Analysis']],
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 130 }
      },
      body: await Promise.all(task.images.map(async (image) => {
        // For each image, prepare a cell with the image and a cell with the analysis
        let imgCell = '';
        try {
          // Resize image for the PDF
          const resizedImageUrl = await resizeImage(image.imageUrl, 150, 150);
          imgCell = resizedImageUrl;
        } catch (error) {
          console.error("Error resizing image for PDF:", error);
          imgCell = '';
        }
        
        // Prepare analysis text
        let analysisText = '';
        if (image.analysisResult && image.analysisResult.claudeAnalysis) {
          analysisText = image.analysisResult.claudeAnalysis;
        } else {
          analysisText = 'No analysis available for this image.';
        }
        
        return [
          { content: imgCell, rowSpan: 1, cellWidth: 40, styles: { minCellHeight: 60 } },
          { content: analysisText, rowSpan: 1, cellWidth: 130 }
        ];
      })),
      didDrawCell: (data) => {
        // This callback is used to draw images in the table
        if (data.column.index === 0 && data.cell.section === 'body') {
          const imgUrl = data.cell.raw;
          if (imgUrl && typeof imgUrl === 'string') {
            try {
              const cellHeight = data.cell.height;
              const cellWidth = data.cell.width;
              const dim = Math.min(cellWidth, cellHeight) - 10;
              const x = data.cell.x + (cellWidth - dim) / 2;
              const y = data.cell.y + 5;
              
              doc.addImage(imgUrl, 'JPEG', x, y, dim, dim);
            } catch (error) {
              console.error("Error adding image to PDF cell:", error);
            }
          }
        }
      }
    });
  }
  
  // Save the PDF
  return URL.createObjectURL(doc.output('blob'));
};

export const downloadPDF = (url: string, filename: string = 'analysis-report.pdf') => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
};
