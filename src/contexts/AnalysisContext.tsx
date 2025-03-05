import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
  userId?: string;
}

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
  date: string;
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
  fetchUserTasks: (userId: string) => Promise<void>;
  analyses: AnalysisResult[];
  currentAnalysis: AnalysisResult | null;
  setCurrentAnalysis: (analysis: AnalysisResult | null) => void;
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
  addAnalysis: () => {},
  getAnalysis: () => undefined,
  setCurrentAnalysis: () => {},
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
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          id, 
          name, 
          description, 
          status, 
          type, 
          created_at, 
          completed_at,
          user_id,
          images (
            id, 
            image_url, 
            description, 
            uploaded_at, 
            analysis_result
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }

      if (data) {
        const formattedTasks: Task[] = data.map((task: any) => ({
          id: task.id,
          name: task.name,
          description: task.description,
          status: task.status,
          type: task.type,
          createdAt: task.created_at,
          completedAt: task.completed_at,
          userId: task.user_id,
          images: task.images ? task.images.map((img: any) => ({
            id: img.id,
            imageUrl: img.image_url,
            description: img.description,
            analysisResult: img.analysis_result,
            uploadedAt: img.uploaded_at,
          })) : [],
        }));

        setTasks(formattedTasks);
      }
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

    const newTask: Task = {
      id: uuidv4(),
      name: type === 'single-lot' ? 'Single Image Analysis' : 'Multi-Image Analysis',
      status: 'pending',
      type,
      createdAt: new Date().toISOString(),
      images: [],
      userId: user.id
    };

    (async () => {
      try {
        const { error } = await supabase
          .from('tasks')
          .insert({
            id: newTask.id,
            name: newTask.name,
            type: newTask.type,
            status: newTask.status,
            created_at: newTask.createdAt,
            user_id: user.id
          });

        if (error) {
          console.error('Error creating task in Supabase:', error);
          toast.error("Failed to create task. Please try again.");
        } else {
          setTasks(prevTasks => [newTask, ...prevTasks]);
        }
      } catch (error) {
        console.error('Error in createTask:', error);
      }
    })();

    return newTask;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const supabaseUpdates: Record<string, any> = {};
      
      if (updates.name) supabaseUpdates.name = updates.name;
      if (updates.description) supabaseUpdates.description = updates.description;
      if (updates.status) supabaseUpdates.status = updates.status;
      if (updates.completedAt) supabaseUpdates.completed_at = updates.completedAt;
      
      if (Object.keys(supabaseUpdates).length > 0) {
        const { error } = await supabase
          .from('tasks')
          .update(supabaseUpdates)
          .eq('id', id);
        
        if (error) {
          console.error('Error updating task in Supabase:', error);
          throw error;
        }
      }
      
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
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting task from Supabase:', error);
        throw error;
      }
      
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
    const newImage: Image = {
      id: uuidv4(),
      imageUrl,
      description,
      uploadedAt: new Date().toISOString(),
    };

    try {
      const { error } = await supabase
        .from('images')
        .insert({
          id: newImage.id,
          image_url: newImage.imageUrl,
          description: newImage.description,
          uploaded_at: newImage.uploadedAt,
          task_id: taskId
        });

      if (error) {
        console.error('Error saving image to Supabase:', error);
        throw error;
      }
      
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
      const { error } = await supabase
        .from('images')
        .delete()
        .eq('id', imageId);

      if (error) {
        console.error('Error deleting image from Supabase:', error);
        throw error;
      }
      
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
