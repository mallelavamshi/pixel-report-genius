
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { 
  Task, 
  TaskImage, 
  AnalysisResult, 
  AnalysisContextType,
  TaskType
} from './types';
import { 
  loadFromLocalStorage, 
  saveToLocalStorage 
} from './utils';
import {
  createTask,
  getUserTier,
  getUserTasks,
  getTask,
  addTask as addTaskToList,
  updateTask as updateTaskInList,
  addImageToTask as addImageToTaskInList,
  removeImageFromTask as removeImageFromTaskInList
} from './taskService';
import {
  addAnalysis as addAnalysisToList,
  getAnalysis as getAnalysisFromLists
} from './analysisService';

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const AnalysisProvider = ({ children }: { children: ReactNode }) => {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>(
    loadFromLocalStorage('analyses', [])
  );
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(
    loadFromLocalStorage('tasks', [])
  );
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  useEffect(() => {
    saveToLocalStorage('analyses', analyses);
  }, [analyses]);

  useEffect(() => {
    saveToLocalStorage('tasks', tasks);
  }, [tasks]);

  const addAnalysis = (analysis: AnalysisResult) => {
    setAnalyses(prev => addAnalysisToList(prev, analysis));
  };

  const getAnalysisById = (id: string) => {
    return getAnalysisFromLists(analyses, tasks, id);
  };

  const addNewTask = (task: Task) => {
    setTasks(prev => addTaskToList(prev, task));
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => {
      const updatedTasks = updateTaskInList(prev, id, updates);
      
      // Check if there are any new analysis results to add
      const updatedTask = updatedTasks.find(task => task.id === id);
      if (updatedTask) {
        updatedTask.images.forEach(image => {
          if (image.analysisResult) {
            addAnalysis(image.analysisResult);
          }
        });
      }
      
      return updatedTasks;
    });
  };

  const addImageToTask = (taskId: string, image: TaskImage) => {
    setTasks(prev => addImageToTaskInList(prev, taskId, image));
  };

  const removeImageFromTask = (taskId: string, imageId: string) => {
    setTasks(prev => removeImageFromTaskInList(prev, taskId, imageId));
  };

  const getTaskById = (id: string) => {
    return getTask(tasks, id);
  };

  const createNewTask = (type: TaskType = 'single-lot') => {
    const newTask = createTask(type, getUserTier());
    addNewTask(newTask);
    console.log("Creating new task:", newTask);
    return newTask;
  };

  const getUserTasksList = (userId: string) => {
    return getUserTasks(tasks, userId);
  };

  return (
    <AnalysisContext.Provider 
      value={{ 
        analyses, 
        currentAnalysis, 
        addAnalysis, 
        getAnalysis: getAnalysisById, 
        setCurrentAnalysis,
        isLoading,
        setIsLoading,
        tasks,
        currentTask,
        addTask: addNewTask,
        updateTask,
        setCurrentTask,
        addImageToTask,
        removeImageFromTask,
        getTask: getTaskById,
        createTask: createNewTask,
        getUserTasks: getUserTasksList,
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

export type { 
  Task, 
  TaskImage, 
  AnalysisResult, 
  TaskType, 
  TaskStatus, 
  TaskTier 
} from './types';
