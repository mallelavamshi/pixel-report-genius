
import { AnalysisResult } from '@/contexts/AnalysisContext';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generatePDF = async (analysis: AnalysisResult): Promise<string> => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(22);
  doc.text('Image Analysis Report', 105, 20, { align: 'center' });
  
  // Add date
  doc.setFontSize(12);
  doc.text(`Generated: ${analysis.date.toLocaleString()}`, 105, 30, { align: 'center' });
  
  // Add image
  try {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    const imgData = await new Promise<string>((resolve, reject) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg'));
      };
      img.onerror = () => reject(new Error('Could not load image'));
      img.src = analysis.imageUrl;
    });
    
    const imgWidth = 180;
    const imgHeight = 100;
    doc.addImage(imgData, 'JPEG', 15, 40, imgWidth, imgHeight);
  } catch (error) {
    console.error('Error adding image to PDF:', error);
    doc.text('Image preview not available', 105, 70, { align: 'center' });
  }
  
  // Add description
  doc.setFontSize(14);
  doc.text('Description:', 15, 150);
  doc.setFontSize(12);
  
  const description = analysis.description;
  const splitDescription = doc.splitTextToSize(description, 180);
  doc.text(splitDescription, 15, 160);
  
  // Add tags
  doc.setFontSize(14);
  doc.text('Tags:', 15, 180);
  doc.setFontSize(12);
  doc.text(analysis.tags.join(', '), 15, 190);
  
  // Add detected objects table
  doc.setFontSize(14);
  doc.text('Detected Objects:', 15, 210);
  
  doc.autoTable({
    startY: 220,
    head: [['Object', 'Confidence']],
    body: analysis.objects.map(obj => [
      obj.name,
      `${(obj.confidence * 100).toFixed(2)}%`
    ]),
  });
  
  // Add color analysis
  const currentY = (doc as any).lastAutoTable.finalY + 20;
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
  
  // Save the PDF
  return URL.createObjectURL(doc.output('blob'));
};

export const downloadPDF = (url: string, filename: string = 'analysis-report.pdf') => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
};
