
import { v4 as uuidv4 } from 'uuid';
import { Task, TaskImage, TaskType, TaskTier } from './types';

export const createTask = (type: TaskType = 'single-lot', userTier: TaskTier): Task => {
  const now = new Date();
  const taskName = type === 'single-lot' ? 'Single Image Analysis' : 'Multi-Image Analysis';
  
  return {
    id: uuidv4(),
    name: taskName,
    title: taskName,
    description: '',
    type: type,
    status: 'pending',
    tier: userTier,
    createdAt: now,
    created: now,
    images: [],  // Make sure this property exists
    maxImages: type === 'multi-lot' ? 10 : 1,
    userId: localStorage.getItem('userRole') || 'user',
    inQueue: false
  };
};

export const getUserTier = (): TaskTier => {
  // This would typically come from an authenticated user object
  // For demo purposes, we'll just return a hardcoded value
  return 'basic';
};

export const getUserTasks = (tasks: Task[], userId: string): Task[] => {
  return tasks.filter(task => task.userId === userId);
};

export const getTask = (tasks: Task[], id: string): Task | undefined => {
  return tasks.find(task => task.id === id);
};

export const addTask = (tasks: Task[], task: Task): Task[] => {
  return [...tasks, task];
};

export const updateTask = (tasks: Task[], id: string, updates: Partial<Task>): Task[] => {
  return tasks.map(task => {
    if (task.id === id) {
      return { ...task, ...updates };
    }
    return task;
  });
};

export const addImageToTask = (tasks: Task[], taskId: string, image: TaskImage): Task[] => {
  return tasks.map(task => 
    task.id === taskId 
      ? { ...task, images: [...task.images, image] }
      : task
  );
};

export const removeImageFromTask = (tasks: Task[], taskId: string, imageId: string): Task[] => {
  return tasks.map(task => 
    task.id === taskId 
      ? { ...task, images: task.images.filter(img => img.id !== imageId) }
      : task
  );
};
