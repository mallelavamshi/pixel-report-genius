import { AnalysisResult, Task } from '@/contexts/AnalysisContext';
import { utils, write } from 'xlsx';
import { jsPDF } from 'jspdf';
import { resizeImage } from '@/services/imgbbService';
import { saveReportToSupabase } from './pdfGenerator';

/**
 * Generate an Excel report - simpler implementation
 */
export const generateExcel = async (analysis: AnalysisResult): Promise<string> => {
  try {
    // Create workbook
    const wb = utils.book_new();
    
    // Create basic info worksheet with EstateGenius AI header
    const headerInfo = [
      ['Email: clara@estategeniusai.com', ''],
      ['Mobile: (+1)4696597089', 'EstateGenius AI'],
      ['Website: www.estategeniusai.com', 'Your Pricing Partner'],
      ['', 'Saves Hours of Internet Search'],
      ['', 'We Customize AI According to Your Needs'],
      [''],  // Empty row for spacing
      ['Image', 'Analysis'],  // Column headers
    ];
    
    // Create analysis text
    let analysisText = analysis.claudeAnalysis || formatAnalysisText(analysis);
    // Add analysis content
    headerInfo.push(['[Image]', analysisText]);
    
    const ws = utils.aoa_to_sheet(headerInfo);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 30 },  // Column A width (for images/left header)
      { wch: 70 }   // Column B width (for analysis/right header)
    ];
    
    // Set row heights
    ws['!rows'] = [
      { hpt: 20 },  // Row 1
      { hpt: 20 },  // Row 2
      { hpt: 20 },  // Row 3
      { hpt: 20 },  // Row 4
      { hpt: 20 },  // Row 5
      { hpt: 20 },  // Row 6 (spacing)
      { hpt: 30 },  // Row 7 (header)
      { hpt: 150 }  // Row 8 (content)
    ];
    
    utils.book_append_sheet(wb, ws, 'Analysis');
    
    // Since we can't easily add images to Excel with SheetJS,
    // we'll also generate a PDF as an alternative for viewing with images
    await generatePDFForExcelFallback(analysis);
    
    // Generate Excel file
    const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const excelUrl = URL.createObjectURL(blob);
    
    // Save to Supabase if there's a task ID
    if (analysis.id) {
      await saveReportToSupabase(analysis.id, null, excelUrl);
    }
    
    return excelUrl;
  } catch (error) {
    console.error('Error generating Excel:', error);
    throw error;
  }
};

/**
 * Generate an Excel report for a task
 */
export const generateTaskExcel = async (task: Task): Promise<string> => {
  try {
    // Create workbook
    const wb = utils.book_new();
    
    // Create basic info worksheet with EstateGenius AI header
    const headerInfo = [
      ['Email: clara@estategeniusai.com', ''],
      ['Mobile: (+1)4696597089', 'EstateGenius AI'],
      ['Website: www.estategeniusai.com', 'Your Pricing Partner'],
      ['', 'Saves Hours of Internet Search'],
      ['', 'We Customize AI According to Your Needs'],
      [''],  // Empty row for spacing
      ['Image', 'Analysis'],  // Column headers
    ];
    
    // Add each image analysis as a row
    task.images.forEach((image, index) => {
      let analysisText = '';
      if (image.analysisResult?.claudeAnalysis) {
        analysisText = image.analysisResult.claudeAnalysis;
      } else if (image.analysisResult) {
        analysisText = formatAnalysisText(image.analysisResult);
      } else {
        analysisText = "No analysis available for this image.";
      }
      
      headerInfo.push([`[Image ${index + 1}]`, analysisText]);
    });
    
    const ws = utils.aoa_to_sheet(headerInfo);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 30 },  // Column A width (for images/left header)
      { wch: 70 }   // Column B width (for analysis/right header)
    ];
    
    // Create row heights array
    const rowHeights = Array(headerInfo.length).fill({ hpt: 20 });
    // Header row
    rowHeights[6] = { hpt: 30 };
    // Content rows
    for (let i = 0; i < task.images.length; i++) {
      rowHeights[7 + i] = { hpt: 150 };
    }
    
    ws['!rows'] = rowHeights;
    
    utils.book_append_sheet(wb, ws, 'Task Analysis');
    
    // Generate a fallback PDF with images
    await generateTaskPDFForExcelFallback(task);
    
    // Generate Excel file
    const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const excelUrl = URL.createObjectURL(blob);
    
    // Save to Supabase if there's a task ID
    if (task.id) {
      await saveReportToSupabase(task.id, null, excelUrl);
    }
    
    return excelUrl;
  } catch (error) {
    console.error('Error generating task Excel:', error);
    throw error;
  }
};

/**
 * Format analysis text with bullet points
 */
function formatAnalysisText(analysis: AnalysisResult): string {
  let text = '';
  
  // Add name if available
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
  
  // Add search results if available
  if (analysis.searchResults && analysis.searchResults.length > 0) {
    const sources = [...new Set(analysis.searchResults.map(r => r.source))];
    sources.forEach(source => {
      const resultsForSource = analysis.searchResults?.filter(r => r.source === source);
      if (resultsForSource && resultsForSource.length > 0) {
        const prices = resultsForSource
          .map(r => r.price)
          .filter(p => p) // Filter out undefined/null
          .join(', ');
        if (prices) {
          text += `• ${source} prices: ${prices}\n`;
        }
      }
    });
  }
  
  return text;
}

/**
 * Generate a fallback PDF with images for Excel exports
 * This creates a PDF named "report_with_images.pdf" that users can open
 * when they need to see the images along with the Excel data
 */
async function generatePDFForExcelFallback(analysis: AnalysisResult): Promise<void> {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    doc.setFontSize(16);
    doc.text("Analysis Report with Images", 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text("(Please see this PDF for images to accompany Excel data)", 105, 30, { align: 'center' });
    
    try {
      // Add image
      const resizedImageUrl = await resizeImage(analysis.imageUrl, 150, 150);
      doc.addImage(resizedImageUrl, 'JPEG', 30, 50, 50, 50);
      
      // Add image caption
      doc.setFontSize(10);
      doc.text("Image for analysis", 30, 110);
    } catch (error) {
      console.error('Error adding image to fallback PDF:', error);
    }
    
    // Save the PDF in a way that won't interfere with browser download
    try {
      const blob = doc.output('blob');
      localStorage.setItem('lastAnalysisImagePDF', URL.createObjectURL(blob));
    } catch (error) {
      console.error('Error saving fallback PDF:', error);
    }
  } catch (error) {
    console.error('Error generating fallback PDF:', error);
  }
}

/**
 * Generate a fallback PDF with images for task Excel exports
 */
async function generateTaskPDFForExcelFallback(task: Task): Promise<void> {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    doc.setFontSize(16);
    doc.text("Task Report with Images", 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text("(Please see this PDF for images to accompany Excel data)", 105, 30, { align: 'center' });
    
    let yPosition = 50;
    
    for (let i = 0; i < task.images.length; i++) {
      // Check if we need a new page
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 30;
      }
      
      try {
        // Add image
        const resizedImageUrl = await resizeImage(task.images[i].imageUrl, 150, 150);
        doc.addImage(resizedImageUrl, 'JPEG', 30, yPosition, 50, 50);
        
        // Add image caption
        doc.setFontSize(10);
        doc.text(`Image ${i+1} for analysis`, 30, yPosition + 60);
        
        yPosition += 70;
      } catch (error) {
        console.error(`Error adding image ${i} to fallback PDF:`, error);
      }
    }
    
    // Save the PDF in a way that won't interfere with browser download
    try {
      const blob = doc.output('blob');
      localStorage.setItem('lastTaskImagePDF', URL.createObjectURL(blob));
    } catch (error) {
      console.error('Error saving fallback PDF:', error);
    }
  } catch (error) {
    console.error('Error generating task fallback PDF:', error);
  }
}

export const downloadExcel = (url: string, filename: string = 'analysis-report.xlsx') => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  
  // Alert user about the image limitations in Excel
  setTimeout(() => {
    alert("Note: Excel file does not include embedded images. A PDF with images is also available for download.");
  }, 1000);
};
