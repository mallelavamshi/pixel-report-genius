
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Define task and image types
export interface Image {
  id: string;
  imageUrl: string;
  description?: string;
  analysisResult?: AnalysisResult;
  uploadedAt: string;
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  type: 'single-lot' | 'multi-lot';
  createdAt: string;
  completedAt?: string;
  images: Image[];
}

// Aliasing Image as TaskImage for backward compatibility
export type TaskImage = Image;

export interface SearchResult {
  title: string;
  source: string;
  price?: string;
  currency?: string;
  extractedPrice?: number;
  url: string;
  thumbnail?: string;
  position?: number;
}

export interface AnalysisResult {
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
  searchResults?: SearchResult[];
  claudeAnalysis?: string;
}

interface AnalysisContextType {
  tasks: Task[];
  currentTask: Task | null;
  setCurrentTask: (task: Task | null) => void;
  createTask: (type: 'single-lot' | 'multi-lot') => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addImageToTask: (taskId: string, imageUrl: string, description?: string) => void;
  removeImageFromTask: (taskId: string, imageId: string) => void;
  getTask: (id: string) => Task | undefined;
  
  // Additional methods needed by components
  getAnalysis: (id: string) => AnalysisResult | undefined;
  addAnalysis: (analysis: AnalysisResult) => void;
  setCurrentAnalysis: (analysis: AnalysisResult | null) => void;
  setIsLoading: (loading: boolean) => void;
  analyses: AnalysisResult[];
  currentAnalysis: AnalysisResult | null;
  isLoading: boolean;
}

// Create context with initial values
const AnalysisContext = createContext<AnalysisContextType>({
  tasks: [],
  currentTask: null,
  setCurrentTask: () => {},
  createTask: () => ({} as Task),
  updateTask: () => {},
  deleteTask: () => {},
  addImageToTask: () => {},
  removeImageFromTask: () => {},
  getTask: () => undefined,
  
  // Additional methods with default values
  analyses: [],
  currentAnalysis: null,
  addAnalysis: () => {},
  getAnalysis: () => undefined,
  setCurrentAnalysis: () => {},
  isLoading: false,
  setIsLoading: () => {},
});

export const AnalysisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    // Load tasks from localStorage if available
    const savedTasks = localStorage.getItem('analysis_tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('analysis_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const createTask = (type: 'single-lot' | 'multi-lot'): Task => {
    const newTask: Task = {
      id: uuidv4(),
      name: type === 'single-lot' ? 'Single Image Analysis' : 'Multi-Image Analysis',
      status: 'pending',
      type,
      createdAt: new Date().toISOString(),
      images: [],
    };

    setTasks(prevTasks => [newTask, ...prevTasks]);
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === id ? { ...task, ...updates } : task
      )
    );
    
    if (currentTask && currentTask.id === id) {
      setCurrentTask({ ...currentTask, ...updates });
    }
  };
  
  const deleteTask = (id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    
    if (currentTask && currentTask.id === id) {
      setCurrentTask(null);
    }
  };

  const addImageToTask = (taskId: string, imageUrl: string, description?: string) => {
    const newImage: Image = {
      id: uuidv4(),
      imageUrl,
      description,
      uploadedAt: new Date().toISOString(),
    };

    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, images: [...task.images, newImage] } 
          : task
      )
    );
    
    if (currentTask && currentTask.id === taskId) {
      setCurrentTask({
        ...currentTask,
        images: [...currentTask.images, newImage],
      });
    }
  };

  const removeImageFromTask = (taskId: string, imageId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, images: task.images.filter(img => img.id !== imageId) } 
          : task
      )
    );
    
    if (currentTask && currentTask.id === taskId) {
      setCurrentTask({
        ...currentTask,
        images: currentTask.images.filter(img => img.id !== imageId),
      });
    }
  };

  const getTask = (id: string) => {
    return tasks.find(task => task.id === id);
  };

  const addAnalysis = (analysis: AnalysisResult) => {
    setAnalyses(prev => [analysis, ...prev]);
  };

  const getAnalysis = (id: string) => {
    return analyses.find(analysis => analysis.id === id);
  };

  return (
    <AnalysisContext.Provider 
      value={{ 
        tasks, 
        currentTask, 
        setCurrentTask, 
        createTask, 
        updateTask,
        deleteTask,
        addImageToTask,
        removeImageFromTask,
        getTask,
        analyses,
        currentAnalysis,
        setCurrentAnalysis,
        addAnalysis,
        getAnalysis,
        isLoading,
        setIsLoading
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysis = () => useContext(AnalysisContext);
