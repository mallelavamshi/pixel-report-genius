
import { utils, write } from 'xlsx';
import { AnalysisResult, Task } from '@/contexts/AnalysisContext';

export const generateExcel = (analysis: AnalysisResult): string => {
  // Create workbook
  const wb = utils.book_new();
  
  // Create basic info worksheet
  const basicInfo = [
    ['Analysis Report'],
    ['Generated', analysis.date.toLocaleString()],
    [''],
    ['Description', analysis.description],
    ['Tags', analysis.tags.join(', ')],
  ];
  
  const wsBasic = utils.aoa_to_sheet(basicInfo);
  utils.book_append_sheet(wb, wsBasic, 'Basic Info');
  
  // Create objects worksheet
  const objectsData = [
    ['Object', 'Confidence'],
    ...analysis.objects.map(obj => [
      obj.name, 
      (obj.confidence * 100).toFixed(2) + '%'
    ])
  ];
  
  const wsObjects = utils.aoa_to_sheet(objectsData);
  utils.book_append_sheet(wb, wsObjects, 'Detected Objects');
  
  // Create colors worksheet
  const colorsData = [
    ['Color', 'Percentage'],
    ...analysis.colors.map(color => [
      color.color,
      color.percentage + '%'
    ])
  ];
  
  const wsColors = utils.aoa_to_sheet(colorsData);
  utils.book_append_sheet(wb, wsColors, 'Color Analysis');
  
  // Add Claude analysis if available
  if (analysis.claudeAnalysis) {
    const claudeData = [
      ['AI Analysis by Claude'],
      [''],
      [analysis.claudeAnalysis]
    ];
    
    const wsClaude = utils.aoa_to_sheet(claudeData);
    utils.book_append_sheet(wb, wsClaude, 'AI Analysis');
  }
  
  // Add search results if available
  if (analysis.searchResults && analysis.searchResults.length > 0) {
    const searchData = [
      ['Product', 'Source', 'Price', 'Currency', 'Extracted Price'],
      ...analysis.searchResults.map(result => [
        result.title,
        result.source,
        result.price || 'N/A',
        result.currency || 'N/A',
        result.extractedPrice ? result.extractedPrice.toString() : 'N/A'
      ])
    ];
    
    const wsSearch = utils.aoa_to_sheet(searchData);
    utils.book_append_sheet(wb, wsSearch, 'Search Results');
  }
  
  // Generate Excel file
  const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  return URL.createObjectURL(blob);
};

export const generateTaskExcel = (task: Task): string => {
  // Create workbook
  const wb = utils.book_new();
  
  // Create task info worksheet
  const taskInfo = [
    ['Task Report'],
    ['Task Name', task.name],
    ['Task Type', task.type === 'multi-lot' ? 'Multi-Lot Analysis' : 'Single-Lot Analysis'],
    ['Created', task.createdAt.toLocaleString()],
    ['Status', task.status],
    task.completedAt ? ['Completed', task.completedAt.toLocaleString()] : ['', ''],
    ['Description', task.description || ''],
  ];
  
  const wsTask = utils.aoa_to_sheet(taskInfo);
  utils.book_append_sheet(wb, wsTask, 'Task Info');
  
  // Create analysis results worksheet
  if (task.images.length > 0) {
    const analysisData = [
      ['Image ID', 'Description', 'Upload Date', 'Analysis Summary'],
      ...task.images.map(image => [
        image.id,
        image.description || 'No description',
        new Date(image.uploadedAt).toLocaleString(),
        image.analysisResult ? 
          (image.analysisResult.claudeAnalysis ? 
            image.analysisResult.claudeAnalysis.substring(0, 500) + '...' : 
            'Analysis result without Claude analysis') : 
          'No analysis available'
      ])
    ];
    
    const wsAnalysis = utils.aoa_to_sheet(analysisData);
    utils.book_append_sheet(wb, wsAnalysis, 'Analysis Results');
    
    // Add individual worksheets for each analyzed image
    task.images.forEach((image, index) => {
      if (image.analysisResult) {
        const analysis = image.analysisResult;
        
        // Basic image analysis info
        const imageAnalysisData = [
          [`Image ${index + 1} Analysis`],
          ['Description', image.description || 'No description'],
          ['Upload Date', new Date(image.uploadedAt).toLocaleString()],
          [''],
          ['AI Analysis'],
          [''],
          [analysis.claudeAnalysis || 'No AI analysis available'],
          [''],
          ['Search Results'],
          ['']
        ];
        
        if (analysis.searchResults && analysis.searchResults.length > 0) {
          imageAnalysisData.push(['Product', 'Source', 'Price']);
          analysis.searchResults.forEach(result => {
            imageAnalysisData.push([
              result.title || 'Unknown Product',
              result.source || 'Unknown Source',
              result.price || 'N/A'
            ]);
          });
        } else {
          imageAnalysisData.push(['No search results available']);
        }
        
        const wsImageAnalysis = utils.aoa_to_sheet(imageAnalysisData);
        utils.book_append_sheet(wb, wsImageAnalysis, `Image ${index + 1}`);
      }
    });
  }
  
  // Generate Excel file
  const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  return URL.createObjectURL(blob);
};

export const downloadExcel = (url: string, filename: string = 'analysis-report.xlsx') => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
};
