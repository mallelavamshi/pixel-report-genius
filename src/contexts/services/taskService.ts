
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { Task, Image } from '../types/analysisTypes';
import { toast } from 'sonner';

export async function fetchUserTasks(userId: string): Promise<Task[]> {
  if (!userId) return [];
  
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
      return data.map((task: any) => ({
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
    }
    
    return [];
  } catch (error) {
    console.error('Error in fetchUserTasks:', error);
    throw error;
  }
}

export function createTask(type: 'single-lot' | 'multi-lot', userId: string): Task {
  if (!userId) {
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
    userId
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
          user_id: userId
        });

      if (error) {
        console.error('Error creating task in Supabase:', error);
        toast.error("Failed to create task. Please try again.");
      }
    } catch (error) {
      console.error('Error in createTask:', error);
    }
  })();

  return newTask;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<void> {
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
  } catch (error) {
    console.error('Error in updateTask:', error);
    throw error;
  }
}

export async function deleteTask(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting task from Supabase:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteTask:', error);
    throw error;
  }
}

export async function addImageToTask(taskId: string, imageUrl: string, description?: string): Promise<Image> {
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
    
    return newImage;
  } catch (error) {
    console.error('Error in addImageToTask:', error);
    throw error;
  }
}

export async function removeImageFromTask(imageId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('images')
      .delete()
      .eq('id', imageId);

    if (error) {
      console.error('Error deleting image from Supabase:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in removeImageFromTask:', error);
    throw error;
  }
}
