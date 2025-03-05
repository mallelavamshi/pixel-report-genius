
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Task, AnalysisResult, Image } from './types/analysisTypes';
import { 
  fetchUserTasks as fetchTasks, 
  createTask as createNewTask, 
  updateTask as updateTaskInDb, 
  deleteTask as deleteTaskFromDb, 
  addImageToTask as addImageToTaskInDb, 
  removeImageFromTask as removeImageFromDb 
} from './services/taskService';
import {
  addAnalysis as addNewAnalysis,
  getAnalysis as getAnalysisById
} from './services/analysisService';

// Re-export types for backward compatibility
export type { Task, AnalysisResult, Image, TaskImage } from './types/analysisTypes';

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
  fetchUserTasks: (userId: string) => Promise<void>;
  analyses: AnalysisResult[];
  currentAnalysis: AnalysisResult | null;
  setCurrentAnalysis: (analysis: AnalysisResult | null) => void;
  addAnalysis: (analysis: AnalysisResult) => void;
  getAnalysis: (id: string) => AnalysisResult | undefined;
  setIsLoading: (loading: boolean) => void;
  isLoading: boolean;
}

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
  fetchUserTasks: async () => {},
  analyses: [],
  currentAnalysis: null,
  setCurrentAnalysis: () => {},
  addAnalysis: () => {},
  getAnalysis: () => undefined,
  isLoading: false,
  setIsLoading: () => {},
});

export const AnalysisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useAuth();

  const fetchUserTasks = async (userId: string) => {
    if (!userId) return;
    
    try {
      const fetchedTasks = await fetchTasks(userId);
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error in fetchUserTasks:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserTasks(user.id).catch(console.error);
    }
  }, [user]);

  const createTask = (type: 'single-lot' | 'multi-lot'): Task => {
    if (!user) {
      toast.error("You must be logged in to create tasks");
      throw new Error("Authentication required");
    }

    const newTask = createNewTask(type, user.id);
    setTasks(prevTasks => [newTask, ...prevTasks]);
    return newTask;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      await updateTaskInDb(id, updates);
      
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === id ? { ...task, ...updates } : task
        )
      );
      
      if (currentTask && currentTask.id === id) {
        setCurrentTask({ ...currentTask, ...updates });
      }
    } catch (error) {
      console.error('Error in updateTask:', error);
      throw error;
    }
  };
  
  const deleteTask = async (id: string) => {
    try {
      await deleteTaskFromDb(id);
      
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      
      if (currentTask && currentTask.id === id) {
        setCurrentTask(null);
      }
    } catch (error) {
      console.error('Error in deleteTask:', error);
      throw error;
    }
  };

  const addImageToTask = async (taskId: string, imageUrl: string, description?: string) => {
    try {
      const newImage = await addImageToTaskInDb(taskId, imageUrl, description);
      
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
    } catch (error) {
      console.error('Error in addImageToTask:', error);
      throw error;
    }
  };

  const removeImageFromTask = async (taskId: string, imageId: string) => {
    try {
      await removeImageFromDb(imageId);
      
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
    } catch (error) {
      console.error('Error in removeImageFromTask:', error);
      throw error;
    }
  };

  const getTask = (id: string) => {
    return tasks.find(task => task.id === id);
  };

  const addAnalysis = (analysis: AnalysisResult) => {
    setAnalyses(prev => addNewAnalysis(prev, analysis));
  };

  const getAnalysis = (id: string) => {
    return getAnalysisById(analyses, id);
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
        fetchUserTasks,
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
