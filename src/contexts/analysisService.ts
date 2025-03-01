
import { AnalysisResult, Task } from './types';

export const addAnalysis = (analyses: AnalysisResult[], analysis: AnalysisResult): AnalysisResult[] => {
  if (!analyses.some(a => a.id === analysis.id)) {
    return [...analyses, analysis];
  }
  return analyses;
};

export const getAnalysis = (
  analyses: AnalysisResult[], 
  tasks: Task[], 
  id: string
): AnalysisResult | undefined => {
  // First check directly in analyses array
  const directAnalysis = analyses.find(analysis => analysis.id === id);
  if (directAnalysis) return directAnalysis;
  
  // If not found, look through all task images
  let result: AnalysisResult | undefined;
  
  tasks.some(task => {
    const foundImage = task.images.find(img => 
      img.analysisResult && img.analysisResult.id === id
    );
    
    if (foundImage && foundImage.analysisResult) {
      result = foundImage.analysisResult;
      return true;
    }
    
    return false;
  });
  
  return result;
};
