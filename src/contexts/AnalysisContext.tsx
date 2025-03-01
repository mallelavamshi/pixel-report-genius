
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export type TaskType = 'multi-lot' | 'single-lot';

export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type TaskTier = 'free' | 'basic' | 'premium';

export type Task = {
  id: string;
  name: string;
  title: string; 
  description?: string;
  type: TaskType;
  status: TaskStatus;
  tier?: TaskTier;
  createdAt: Date;
  created: Date;
  completedAt?: Date;
  images: TaskImage[];
  imageUrl?: string;
  maxImages?: number;
  userId?: string;
  inQueue?: boolean;
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
  createTask: (type?: TaskType) => Task;
  getUserTasks: (userId: string) => Task[];
  getUserTier: () => TaskTier;
};

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

const parseWithDates = (json: string) => {
  return JSON.parse(json, (key, value) => {
    if (typeof value === 'string' && 
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*Z$/.test(value)) {
      return new Date(value);
    }
    return value;
  });
};

export const AnalysisProvider = ({ children }: { children: ReactNode }) => {
  const initialAnalyses = () => {
    try {
      const saved = localStorage.getItem('analyses');
      return saved ? parseWithDates(saved) : [];
    } catch (e) {
      console.error('Error loading analyses from localStorage:', e);
      return [];
    }
  };

  const initialTasks = () => {
    try {
      const saved = localStorage.getItem('tasks');
      return saved ? parseWithDates(saved) : [];
    } catch (e) {
      console.error('Error loading tasks from localStorage:', e);
      return [];
    }
  };

  const [analyses, setAnalyses] = useState<AnalysisResult[]>(initialAnalyses);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('analyses', JSON.stringify(analyses));
    } catch (e) {
      console.error('Error saving analyses to localStorage:', e);
    }
  }, [analyses]);

  useEffect(() => {
    try {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (e) {
      console.error('Error saving tasks to localStorage:', e);
    }
  }, [tasks]);

  const addAnalysis = (analysis: AnalysisResult) => {
    if (!analyses.some(a => a.id === analysis.id)) {
      setAnalyses(prev => [...prev, analysis]);
    }
  };

  const getAnalysis = (id: string) => {
    const directAnalysis = analyses.find(analysis => analysis.id === id);
    if (directAnalysis) return directAnalysis;
    
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

  const createTask = (type: TaskType = 'single-lot') => {
    const now = new Date();
    const taskName = type === 'single-lot' ? 'Single Image Analysis' : 'Multi-Image Analysis';
    
    const newTask: Task = {
      id: uuidv4(),
      name: taskName,
      title: taskName,
      description: '',
      type: type,
      status: 'pending',
      tier: getUserTier(),
      createdAt: now,
      created: now,
      images: [],
      maxImages: type === 'multi-lot' ? 10 : 1,
      userId: localStorage.getItem('userRole') || 'user',
      inQueue: false
    };
    
    addTask(newTask);
    console.log("Creating new task:", newTask);
    return newTask;
  };

  const addTask = (task: Task) => {
    setTasks(prev => [...prev, task]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const updatedTask = { ...task, ...updates };
        
        if (updatedTask.images) {
          updatedTask.images.forEach(image => {
            if (image.analysisResult) {
              addAnalysis(image.analysisResult);
            }
          });
        }
        
        return updatedTask;
      }
      return task;
    }));
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

  const getUserTasks = (userId: string) => {
    return tasks.filter(task => task.userId === userId);
  };

  const getUserTier = (): TaskTier => {
    // This would typically come from an authenticated user object
    // For demo purposes, we'll just return a hardcoded value
    return 'basic';
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
        getTask,
        createTask,
        getUserTasks,
        getUserTier
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
