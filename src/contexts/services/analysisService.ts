
import { AnalysisResult } from '../types/analysisTypes';

export function addAnalysis(analyses: AnalysisResult[], analysis: AnalysisResult): AnalysisResult[] {
  return [analysis, ...analyses];
}

export function getAnalysis(analyses: AnalysisResult[], id: string): AnalysisResult | undefined {
  return analyses.find(analysis => analysis.id === id);
}
