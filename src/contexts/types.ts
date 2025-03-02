
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

export type SearchResult = {
  title: string;
  source: string;
  price?: string;
  currency?: string;
  extractedPrice?: number;
  url?: string;  // Add this property to match expected type
  link?: string; // Keep this too for backward compatibility
  thumbnail?: string;
  position?: number;
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
  searchResults?: SearchResult[];
  claudeAnalysis?: string;
};




export type AnalysisContextType = {
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
