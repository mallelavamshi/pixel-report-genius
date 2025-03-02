
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Define task and image types
export interface Image {
  id: string;
  imageUrl: string;
  description?: string;
  analysisResult?: any;
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

interface AnalysisContextType {
  tasks: Task[];
  currentTask: Task | null;
  setCurrentTask: (task: Task | null) => void;
  createTask: (type: 'single-lot' | 'multi-lot') => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addImageToTask: (taskId: string, imageUrl: string, description?: string) => void;
  getTask: (id: string) => Task | undefined;
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
  getTask: () => undefined,
});

export const AnalysisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    // Load tasks from localStorage if available
    const savedTasks = localStorage.getItem('analysis_tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

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

  const getTask = (id: string) => {
    return tasks.find(task => task.id === id);
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
        getTask 
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysis = () => useContext(AnalysisContext);
