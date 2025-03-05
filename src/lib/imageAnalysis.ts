import { AnalysisResult } from '@/contexts/types/analysisTypes';

const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

const detectObjects = (imageUrl: string) => {
  return [
    {
      name: "Person",
      confidence: 0.98,
      boundingBox: { x: 10, y: 10, width: 100, height: 200 }
    },
    {
      name: "Car",
      confidence: 0.85,
      boundingBox: { x: 200, y: 100, width: 150, height: 100 }
    },
    {
      name: "Tree",
      confidence: 0.92,
      boundingBox: { x: 50, y: 300, width: 80, height: 120 }
    }
  ];
};

const analyzeColors = (imageUrl: string) => {
  return [
    { color: "#336699", percentage: 45 },
    { color: "#66CC99", percentage: 30 },
    { color: "#FFCC66", percentage: 15 },
    { color: "#CC6666", percentage: 10 }
  ];
};

const generateTags = (imageUrl: string) => {
  return ["nature", "outdoor", "sunny", "landscape"];
};

const generateDescription = (imageUrl: string) => {
  return "A beautiful outdoor scene with people enjoying nature on a sunny day.";
};

export const analyzeImage = async (imageUrl: string): Promise<AnalysisResult> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    id: generateId(),
    imageUrl,
    date: new Date().toISOString(),
    objects: detectObjects(imageUrl),
    colors: analyzeColors(imageUrl),
    tags: generateTags(imageUrl),
    description: generateDescription(imageUrl)
  };
};
