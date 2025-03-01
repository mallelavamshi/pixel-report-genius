
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
  
  if (task.description) {
    doc.setFontSize(14);
    doc.text('Description:', 15, 100);
    doc.setFontSize(12);
    const splitDesc = doc.splitTextToSize(task.description, 180);
    doc.text(splitDesc, 15, 110);
  }
  
  let yPosition = task.description ? 140 : 100;
  
  // Add analysis results if available
  if (task.images.some(img => img.analysisResult)) {
    doc.addPage();
    doc.setFontSize(18);
    doc.text('Analysis Results', 105, 20, { align: 'center' });
    
    let currentY = 40;
    
    // Process images one by one with the required format
    for (const image of task.images) {
      if (!image.analysisResult) continue;
      
      // Check if we need a new page
      if (currentY > 250) {
        doc.addPage();
        currentY = 40;
      }
      
      try {
        // Resize image
        const resizedImageUrl = await resizeImage(image.imageUrl, 200, 200);
        
        // Add image
        doc.addImage(resizedImageUrl, 'JPEG', 15, currentY, 50, 50);
        
        // Add analysis text next to image
        doc.setFontSize(12);
        const analysisText = image.analysisResult.claudeAnalysis || "No analysis available";
        const splitAnalysis = doc.splitTextToSize(analysisText.substring(0, 800) + "...", 130); // Limit text and width
        
        doc.text(splitAnalysis, 70, currentY);
        
        // Calculate the height used so we know where to place the next image
        const textHeight = Math.max(splitAnalysis.length * 5, 50); // Estimate 5mm per line
        currentY += textHeight + 20; // Add some padding
      } catch (error) {
        console.error('Error processing image for PDF:', error);
        doc.text('Error processing image', 15, currentY);
        currentY += 20;
      }
    }
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
