import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

export interface AnalysisResult {
  id: string;
  imageUrl: string;
  date: Date;
  objects?: { name: string; confidence: number; boundingBox?: { x: number; y: number; width: number; height: number } }[];
  colors?: { color: string; percentage: number }[];
  tags?: string[];
  description?: string;
  searchResults?: { title: string; price: string; source: string; url: string }[];
  claudeAnalysis?: string;
}

export interface Image {
  id: string;
  imageUrl: string;
  description?: string;
  uploadedAt: Date;
  analysisResult?: AnalysisResult;
}

export type TaskImage = Image;

export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type TaskType = 'single-lot' | 'multi-lot';

export interface Task {
  id: string;
  name: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  images: Image[];
  createdAt: Date;
  completedAt?: Date;
  user_id?: string;
}

interface AnalysisContextType {
  analysisResults: AnalysisResult[];
  currentAnalysis: AnalysisResult | null;
  tasks: Task[];
  setAnalysisResults: React.Dispatch<React.SetStateAction<AnalysisResult[]>>;
  addAnalysisResult: (result: AnalysisResult) => void;
  setCurrentAnalysis: React.Dispatch<React.SetStateAction<AnalysisResult | null>>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'user_id'>) => Promise<string>;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  removeTask: (taskId: string) => void;
  getTask: (taskId: string) => Task | undefined;
  uploadImage: (taskId: string, image: Omit<Image, 'id' | 'uploadedAt'>) => void;
  loadingTasks: boolean;
  
  addImageToTask: (taskId: string, image: TaskImage) => void;
  removeImageFromTask: (taskId: string, imageId: string) => void;
  getAnalysis: (id: string) => AnalysisResult | undefined;
  addAnalysis: (result: AnalysisResult) => void;
  setIsLoading: (loading: boolean) => void;
  createTask: (type: TaskType) => Task;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const AnalysisProvider = ({ children }: { children: ReactNode }) => {
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      setLoadingTasks(true);
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;

      if (!tasksData) {
        setTasks([]);
        return;
      }

      const formattedTasks = await Promise.all(
        tasksData.map(async (task) => {
          const { data: imagesData, error: imagesError } = await supabase
            .from('images')
            .select('*')
            .eq('task_id', task.id)
            .order('uploaded_at', { ascending: true });

          if (imagesError) throw imagesError;

          const mappedImages = imagesData ? imagesData.map((image) => ({
            id: image.id,
            imageUrl: image.image_url,
            description: image.description,
            uploadedAt: new Date(image.uploaded_at),
            analysisResult: image.analysis_result ? convertJsonToAnalysisResult(image.analysis_result) : undefined
          })) : [];

          return {
            id: task.id,
            name: task.name,
            description: task.description,
            type: task.type as TaskType,
            status: task.status as TaskStatus,
            createdAt: new Date(task.created_at),
            completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
            user_id: task.user_id,
            images: mappedImages
          };
        })
      );

      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoadingTasks(false);
    }
  };

  const convertJsonToAnalysisResult = (json: any): AnalysisResult => {
    if (!json) return null as unknown as AnalysisResult;
    
    return {
      id: json.id || uuidv4(),
      imageUrl: json.imageUrl || '',
      date: json.date ? new Date(json.date) : new Date(),
      objects: json.objects || [],
      colors: json.colors || [],
      tags: json.tags || [],
      description: json.description || '',
      searchResults: json.searchResults || [],
      claudeAnalysis: json.claudeAnalysis || ''
    };
  };

  const addAnalysisResult = (result: AnalysisResult) => {
    setAnalysisResults(prev => [...prev, result]);
  };

  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'user_id'>): Promise<string> => {
    if (!user) {
      throw new Error('User must be logged in to add tasks');
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          name: task.name,
          description: task.description,
          type: task.type,
          status: task.status,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      if (!data) {
        throw new Error('Failed to create task');
      }

      const newTask: Task = {
        id: data.id,
        name: data.name,
        description: data.description,
        type: data.type as TaskType,
        status: data.status as TaskStatus,
        createdAt: new Date(data.created_at),
        user_id: data.user_id,
        images: []
      };

      setTasks(prev => [newTask, ...prev]);
      return data.id;
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to create task');
      throw error;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return;

      const dbUpdates: any = {};
      
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.completedAt) dbUpdates.completed_at = updates.completedAt;
      
      if (Object.keys(dbUpdates).length > 0) {
        const { error } = await supabase
          .from('tasks')
          .update(dbUpdates)
          .eq('id', taskId);

        if (error) throw error;
      }

      if (updates.images) {
        const currentTask = tasks[taskIndex];
        const newImages = updates.images.filter(img => !currentTask.images.some(existingImg => existingImg.id === img.id));
        
        for (const image of newImages) {
          const { error } = await supabase
            .from('images')
            .insert({
              task_id: taskId,
              image_url: image.imageUrl,
              description: image.description,
              analysis_result: image.analysisResult ? JSON.parse(JSON.stringify(image.analysisResult)) : null
            });
            
          if (error) {
            console.error('Error inserting image:', error);
            throw error;
          }
          
          if (image.analysisResult) {
            const { error: updateError } = await supabase
              .from('images')
              .update({ 
                analysis_result: JSON.parse(JSON.stringify(image.analysisResult))
              })
              .eq('task_id', taskId)
              .eq('image_url', image.imageUrl);
              
            if (updateError) {
              console.error('Error updating image analysis:', updateError);
              throw updateError;
            }
          }
        }
      }

      const updatedTask = { ...tasks[taskIndex], ...updates };
      const updatedTasks = [...tasks];
      updatedTasks[taskIndex] = updatedTask;
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const removeTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success('Task removed successfully');
    } catch (error) {
      console.error('Error removing task:', error);
      toast.error('Failed to remove task');
    }
  };

  const getTask = (taskId: string) => {
    return tasks.find(task => task.id === taskId);
  };

  const uploadImage = async (taskId: string, image: Omit<Image, 'id' | 'uploadedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('images')
        .insert({
          task_id: taskId,
          image_url: image.imageUrl,
          description: image.description
        })
        .select()
        .single();

      if (error) throw error;
      
      if (!data) {
        throw new Error('Failed to upload image');
      }

      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return;

      const newImage: Image = {
        id: data.id,
        imageUrl: data.image_url,
        description: data.description,
        uploadedAt: new Date(data.uploaded_at)
      };

      const updatedTask = { ...tasks[taskIndex] };
      updatedTask.images = [...updatedTask.images, newImage];

      const updatedTasks = [...tasks];
      updatedTasks[taskIndex] = updatedTask;
      setTasks(updatedTasks);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    }
  };

  const addImageToTask = async (taskId: string, image: TaskImage) => {
    try {
      const { data, error } = await supabase
        .from('images')
        .insert({
          task_id: taskId,
          image_url: image.imageUrl,
          description: image.description,
          analysis_result: image.analysisResult ? JSON.parse(JSON.stringify(image.analysisResult)) : null
        })
        .select()
        .single();

      if (error) throw error;
      
      if (!data) {
        throw new Error('Failed to add image to task');
      }

      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return;

      const newImage: Image = {
        id: data.id,
        imageUrl: data.image_url,
        description: data.description,
        uploadedAt: new Date(data.uploaded_at),
        analysisResult: image.analysisResult
      };

      const updatedTask = { ...tasks[taskIndex] };
      updatedTask.images = [...updatedTask.images, newImage];

      const updatedTasks = [...tasks];
      updatedTasks[taskIndex] = updatedTask;
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Error adding image to task:', error);
      throw error;
    }
  };

  const removeImageFromTask = async (taskId: string, imageId: string) => {
    try {
      const { error } = await supabase
        .from('images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return;

      const updatedTask = { ...tasks[taskIndex] };
      updatedTask.images = updatedTask.images.filter(img => img.id !== imageId);

      const updatedTasks = [...tasks];
      updatedTasks[taskIndex] = updatedTask;
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Error removing image from task:', error);
      toast.error('Failed to remove image');
    }
  };

  const getAnalysis = (id: string): AnalysisResult | undefined => {
    const result = analysisResults.find(a => a.id === id);
    if (result) return result;
    
    for (const task of tasks) {
      for (const image of task.images) {
        if (image.analysisResult && image.analysisResult.id === id) {
          return image.analysisResult;
        }
      }
    }
    
    return undefined;
  };

  const addAnalysis = (result: AnalysisResult) => {
    setAnalysisResults(prev => [...prev, result]);
  };

  const createTask = (type: TaskType = 'single-lot'): Task => {
    if (!user) {
      throw new Error('User must be logged in to create a task');
    }

    const newTask: Task = {
      id: uuidv4(),
      name: type === 'single-lot' ? 'Single Analysis' : 'Multi-Lot Analysis',
      type: type,
      status: 'pending',
      images: [],
      createdAt: new Date(),
      user_id: user.id
    };

    setTasks(prev => [newTask, ...prev]);
    
    supabase
      .from('tasks')
      .insert({
        id: newTask.id,
        name: newTask.name,
        type: newTask.type,
        status: newTask.status,
        user_id: user.id
      })
      .then(({ error }) => {
        if (error) {
          console.error('Error creating task in database:', error);
          toast.error('Failed to save task to database');
        }
      });

    return newTask;
  };

  return (
    <AnalysisContext.Provider
      value={{
        analysisResults,
        currentAnalysis,
        tasks,
        setAnalysisResults,
        addAnalysisResult,
        setCurrentAnalysis,
        addTask,
        updateTask,
        removeTask,
        getTask,
        uploadImage,
        loadingTasks,
        addImageToTask,
        removeImageFromTask,
        getAnalysis,
        addAnalysis,
        setIsLoading,
        createTask
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
