
import { Session, User } from '@supabase/supabase-js';

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
