
import * as XLSX from 'xlsx';
import { AnalysisResult, Task } from '@/contexts/AnalysisContext';

export const generateExcel = (analysis: AnalysisResult): string => {
  // Create a new workbook
  const wb = XLSX.utils.book_new();
  
  // Create worksheets for different sections
  
  // General Information
  const generalInfo = [
    ['Analysis Report'],
    ['Date', analysis.date.toLocaleString()],
    ['Description', analysis.description],
    ['Tags', analysis.tags.join(', ')],
  ];
  const wsInfo = XLSX.utils.aoa_to_sheet(generalInfo);
  XLSX.utils.book_append_sheet(wb, wsInfo, 'General Info');
  
  // Objects Detected
  const objectsData = [
    ['Object', 'Confidence'],
    ...analysis.objects.map(obj => [
      obj.name,
      obj.confidence
    ])
  ];
  const wsObjects = XLSX.utils.aoa_to_sheet(objectsData);
  XLSX.utils.book_append_sheet(wb, wsObjects, 'Detected Objects');
  
  // Color Analysis
  const colorsData = [
    ['Color', 'Percentage'],
    ...analysis.colors.map(color => [
      color.color,
      color.percentage
    ])
  ];
  const wsColors = XLSX.utils.aoa_to_sheet(colorsData);
  XLSX.utils.book_append_sheet(wb, wsColors, 'Color Analysis');
  
  // Search Results if available
  if (analysis.searchResults && analysis.searchResults.length > 0) {
    const searchData = [
      ['Product', 'Source', 'Price', 'Currency', 'Extracted Price'],
      ...analysis.searchResults.map(result => [
        result.title,
        result.source,
        result.price || 'N/A',
        result.currency || 'N/A',
        result.extractedPrice || 'N/A',
      ])
    ];
    const wsSearch = XLSX.utils.aoa_to_sheet(searchData);
    XLSX.utils.book_append_sheet(wb, wsSearch, 'Similar Products');
  }
  
  // Claude Analysis if available
  if (analysis.claudeAnalysis) {
    const claudeData = [
      ['AI Analysis by Claude'],
      [analysis.claudeAnalysis]
    ];
    const wsClaude = XLSX.utils.aoa_to_sheet(claudeData);
    XLSX.utils.book_append_sheet(wb, wsClaude, 'AI Analysis');
  }
  
  // Generate and return Excel file
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  return URL.createObjectURL(blob);
};

export const generateTaskExcel = (task: Task): string => {
  // Create a new workbook
  const wb = XLSX.utils.book_new();
  
  // Set columns width for the analysis worksheet to meet requirements
  const wscols = [
    { wch: 25 }, // column 1 (image) - 200px equivalent in Excel units
    { wch: 100 }  // column 2 (analysis) - 200px equivalent in Excel units
  ];
  
  // Create the analysis results worksheet
  if (task.images.some(img => img.analysisResult)) {
    const resultsData = [
      ['Image', 'Analysis'],
    ];
    
    // Add a row for each image and its analysis
    task.images
      .filter(img => img.analysisResult)
      .forEach(image => {
        resultsData.push([
          image.description || 'Image',
          image.analysisResult?.claudeAnalysis || 'No analysis available'
        ]);
      });
    
    const wsResults = XLSX.utils.aoa_to_sheet(resultsData);
    
    // Set column widths
    wsResults['!cols'] = wscols;
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, wsResults, 'Analysis Results');
  }
  
  // Task Information
  const taskInfo = [
    ['Task Report: ' + task.name],
    ['Type', task.type === 'multi-lot' ? 'Multi-Lot Analysis' : 'Single-Lot Analysis'],
    ['Created', task.createdAt.toLocaleString()],
    ['Status', task.status],
    ['Completed', task.completedAt ? task.completedAt.toLocaleString() : 'N/A'],
    ['Description', task.description || 'N/A'],
    ['Images Count', task.images.length.toString()],
  ];
  const wsTask = XLSX.utils.aoa_to_sheet(taskInfo);
  XLSX.utils.book_append_sheet(wb, wsTask, 'Task Info');
  
  // Images Summary
  const imagesData = [
    ['Image #', 'Description', 'Upload Date', 'Has Analysis'],
    ...task.images.map((image, index) => [
      (index + 1).toString(),
      image.description || 'No description',
      image.uploadedAt.toLocaleString(),
      image.analysisResult ? 'Yes' : 'No'
    ])
  ];
  const wsImages = XLSX.utils.aoa_to_sheet(imagesData);
  XLSX.utils.book_append_sheet(wb, wsImages, 'Images');
  
  // Generate and return Excel file
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  return URL.createObjectURL(blob);
};

export const downloadExcel = (url: string, filename: string = 'analysis-report.xlsx') => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
};
