
import React, { createContext, useState, useContext, ReactNode } from 'react';

export type AnalysisResult = {
  id: string;
  imageUrl: string;
  date: Date;
  objects: Array<{
    name: string;
    confidence: number;
    boundingBox: {
      x: number;
      y: number;
      width: number;
      height: number;
    }
  }>;
  colors: Array<{
    color: string;
    percentage: number;
  }>;
  tags: string[];
  description: string;
};

type AnalysisContextType = {
  analyses: AnalysisResult[];
  currentAnalysis: AnalysisResult | null;
  addAnalysis: (analysis: AnalysisResult) => void;
  getAnalysis: (id: string) => AnalysisResult | undefined;
  setCurrentAnalysis: (analysis: AnalysisResult | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
};

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const AnalysisProvider = ({ children }: { children: ReactNode }) => {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const addAnalysis = (analysis: AnalysisResult) => {
    setAnalyses(prev => [...prev, analysis]);
  };

  const getAnalysis = (id: string) => {
    return analyses.find(analysis => analysis.id === id);
  };

  return (
    <AnalysisContext.Provider 
      value={{ 
        analyses, 
        currentAnalysis, 
        addAnalysis, 
        getAnalysis, 
        setCurrentAnalysis,
        isLoading,
        setIsLoading
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
};
