
import React, { createContext, useState, useContext, ReactNode } from 'react';

export type TaskType = 'multi-lot' | 'single-lot';

export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type Task = {
  id: string;
  name: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  createdAt: Date;
  completedAt?: Date;
  images: TaskImage[];
};

export type TaskImage = {
  id: string;
  imageUrl: string;
  description?: string;
  uploadedAt: Date;
  analysisResult?: AnalysisResult;
};

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
  searchResults?: Array<{
    title: string;
    source: string;
    price?: string;
    currency?: string;
    extractedPrice?: number;
  }>;
  claudeAnalysis?: string;
};

type AnalysisContextType = {
  analyses: AnalysisResult[];
  currentAnalysis: AnalysisResult | null;
  tasks: Task[];
  currentTask: Task | null;
  addAnalysis: (analysis: AnalysisResult) => void;
  getAnalysis: (id: string) => AnalysisResult | undefined;
  setCurrentAnalysis: (analysis: AnalysisResult | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  setCurrentTask: (task: Task | null) => void;
  addImageToTask: (taskId: string, image: TaskImage) => void;
  removeImageFromTask: (taskId: string, imageId: string) => void;
  getTask: (id: string) => Task | undefined;
};

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const AnalysisProvider = ({ children }: { children: ReactNode }) => {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  const addAnalysis = (analysis: AnalysisResult) => {
    setAnalyses(prev => [...prev, analysis]);
  };

  const getAnalysis = (id: string) => {
    return analyses.find(analysis => analysis.id === id);
  };

  const addTask = (task: Task) => {
    setTasks(prev => [...prev, task]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  };

  const addImageToTask = (taskId: string, image: TaskImage) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, images: [...task.images, image] }
        : task
    ));
  };

  const removeImageFromTask = (taskId: string, imageId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, images: task.images.filter(img => img.id !== imageId) }
        : task
    ));
  };

  const getTask = (id: string) => {
    return tasks.find(task => task.id === id);
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
        setIsLoading,
        tasks,
        currentTask,
        addTask,
        updateTask,
        setCurrentTask,
        addImageToTask,
        removeImageFromTask,
        getTask
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
