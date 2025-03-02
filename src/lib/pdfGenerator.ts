import { AnalysisResult, Task } from '@/contexts/AnalysisContext';
import { jsPDF } from 'jspdf';
import { resizeImage } from '@/services/imgbbService';

// Import explicitly for autoTable
import 'jspdf-autotable';

// Extend jsPDF type definitions to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

/**
 * Generate a PDF report in the EstateGenius AI style
 */
export const generatePDF = async (analysis: AnalysisResult): Promise<string> => {
  try {
    // A4 size in mm: 210 x 297
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Add EstateGenius AI style header
    addHeader(doc);
    
    // Define starting position after header
    const startY = 50;
    
    // Add table headers
    doc.setFillColor(128, 128, 128);  // Grey background
    doc.setTextColor(255, 255, 255);  // White text
    doc.setFontSize(12);
    doc.rect(10, startY, 60, 10, 'F');
    doc.rect(70, startY, 130, 10, 'F');
    doc.text("Image", 40, startY + 6, { align: 'center' });
    doc.text("Analysis", 135, startY + 6, { align: 'center' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Add image and analysis
    try {
      // Add image cell with border
      doc.setDrawColor(0);
      doc.rect(10, startY + 10, 60, 60);
      doc.setFillColor(245, 245, 220);  // Beige background
      doc.rect(10, startY + 10, 60, 60, 'F');
      
      // Add image
      const resizedImageUrl = await resizeImage(analysis.imageUrl, 150, 150);
      doc.addImage(resizedImageUrl, 'JPEG', 15, startY + 15, 50, 50);
      
      // Add analysis cell with border
      doc.rect(70, startY + 10, 130, 60);
      doc.setFillColor(245, 245, 220);  // Beige background
      doc.rect(70, startY + 10, 130, 60, 'F');
      
      // Format analysis content with bullet points
      doc.setFontSize(10);
      const analysisText = formatAnalysisText(analysis);
      
      // Split text to fit in cell
      const splitText = doc.splitTextToSize(analysisText, 120);
      doc.text(splitText, 75, startY + 20);
    } catch (error) {
      console.error('Error adding content to PDF:', error);
      doc.text('Image or analysis not available', 75, startY + 30);
    }
    
    // Save the PDF
    return URL.createObjectURL(doc.output('blob'));
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

/**
 * Generate a PDF report for a multi-lot task
 */
export const generateTaskPDF = async (task: Task): Promise<string> => {
  try {
    // A4 size in mm: 210 x 297
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Add EstateGenius AI style header
    addHeader(doc);
    
    // Define starting position after header
    let currentY = 50;
    
    // Add table headers
    doc.setFillColor(128, 128, 128);  // Grey background
    doc.setTextColor(255, 255, 255);  // White text
    doc.setFontSize(12);
    doc.rect(10, currentY, 60, 10, 'F');
    doc.rect(70, currentY, 130, 10, 'F');
    doc.text("Image", 40, currentY + 6, { align: 'center' });
    doc.text("Analysis", 135, currentY + 6, { align: 'center' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    currentY += 10;
    
    // Process each image
    for (let i = 0; i < task.images.length; i++) {
      const image = task.images[i];
      
      // Check if we need a new page
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
        
        // Add table headers on new page
        doc.setFillColor(128, 128, 128);
        doc.setTextColor(255, 255, 255);
        doc.rect(10, currentY, 60, 10, 'F');
        doc.rect(70, currentY, 130, 10, 'F');
        doc.text("Image", 40, currentY + 6, { align: 'center' });
        doc.text("Analysis", 135, currentY + 6, { align: 'center' });
        doc.setTextColor(0, 0, 0);
        currentY += 10;
      }
      
      // Add image cell with border
      doc.setDrawColor(0);
      doc.rect(10, currentY, 60, 60);
      doc.setFillColor(245, 245, 220);  // Beige background
      doc.rect(10, currentY, 60, 60, 'F');
      
      try {
        // Add image
        const resizedImageUrl = await resizeImage(image.imageUrl, 150, 150);
        doc.addImage(resizedImageUrl, 'JPEG', 15, currentY + 5, 50, 50);
      } catch (error) {
        console.error('Error adding image to PDF:', error);
        doc.text('Image not available', 25, currentY + 30);
      }
      
      // Add analysis cell with border
      doc.rect(70, currentY, 130, 60);
      doc.setFillColor(245, 245, 220);  // Beige background
      doc.rect(70, currentY, 130, 60, 'F');
      
      // Format analysis content
      doc.setFontSize(10);
      if (image.analysisResult) {
        const analysisText = formatAnalysisText(image.analysisResult);
        const splitText = doc.splitTextToSize(analysisText, 120);
        doc.text(splitText, 75, currentY + 10);
      } else {
        doc.text('No analysis available for this image.', 75, currentY + 30);
      }
      
      currentY += 60;
    }
    
    // Save the PDF
    return URL.createObjectURL(doc.output('blob'));
  } catch (error) {
    console.error('Error generating task PDF:', error);
    throw error;
  }
};

/**
 * Add EstateGenius AI style header to PDF
 */
function addHeader(doc: jsPDF): void {
  // Add contact info (top left)
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);  // Grey color
  doc.text("Email: clara@estategeniusai.com", 20, 15);
  doc.text("Mobile: (+1)4696597089", 20, 20);
  doc.text("Website: www.estategeniusai.com", 20, 25);
  
  // Add main title (center)
  doc.setFontSize(16);
  doc.setTextColor(217, 119, 87);  // Orange/coral color
  doc.text("EstateGenius AI", 105, 15, { align: 'center' });
  
  // Add taglines (center)
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text("Your Pricing Partner", 105, 25, { align: 'center' });
  doc.text("Saves Hours of Internet Search", 105, 30, { align: 'center' });
  doc.text("We Customize AI According to Your Needs", 105, 35, { align: 'center' });
}

/**
 * Format analysis text with bullet points
 */
function formatAnalysisText(analysis: AnalysisResult): string {
  let text = '';
  
  // Add name if available
  if (analysis.claudeAnalysis) {
    return analysis.claudeAnalysis;
  }
  
  // Otherwise format from basic analysis
  text += `• Name: "${analysis.description || 'Analyzed Item'}"\n`;
  text += `• Opinion: This item appears to be in good condition. `;
  text += `It has several distinguishing features that make it collectable.\n`;
  
  // Add objects detected
  if (analysis.objects && analysis.objects.length > 0) {
    text += `• Key Features: ${analysis.objects.map(obj => obj.name).join(', ')}\n`;
  }
  
  // Add tags
  if (analysis.tags && analysis.tags.length > 0) {
    text += `• Tags: ${analysis.tags.join(', ')}\n`;
  }
  
  return text;
}

export const downloadPDF = (url: string, filename: string = 'analysis-report.pdf') => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
};