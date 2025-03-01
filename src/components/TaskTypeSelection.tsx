
import { Card, CardContent } from "@/components/ui/card";
import { FileIcon, ImageIcon } from "lucide-react";

type TaskType = 'single-lot' | 'multi-lot';

type TaskTypeSelectionProps = {
  value: TaskType;
  onChange: (value: TaskType) => void;
};

const TaskTypeSelection = ({ value, onChange }: TaskTypeSelectionProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card 
        className={`border cursor-pointer hover:bg-accent/50 transition-colors ${
          value === 'single-lot' ? 'border-primary bg-primary/5' : ''
        }`}
        onClick={() => onChange('single-lot')}
      >
        <CardContent className="p-4 flex items-center space-x-4">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
            value === 'single-lot' ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}>
            <ImageIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-medium">Single-Lot Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Analyze a single image in detail
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card 
        className={`border cursor-pointer hover:bg-accent/50 transition-colors ${
          value === 'multi-lot' ? 'border-primary bg-primary/5' : ''
        }`}
        onClick={() => onChange('multi-lot')}
      >
        <CardContent className="p-4 flex items-center space-x-4">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
            value === 'multi-lot' ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}>
            <FileIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-medium">Multi-Lot Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Process multiple images at once
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskTypeSelection;
