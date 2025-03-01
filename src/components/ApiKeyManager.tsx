
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type ApiKey = {
  imgbb: string;
  searchApi: string;
  anthropic: string;
};

export const useApiKeys = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey>(() => {
    const savedKeys = localStorage.getItem('apiKeys');
    return savedKeys ? JSON.parse(savedKeys) : {
      imgbb: '',
      searchApi: '',
      anthropic: ''
    };
  });

  useEffect(() => {
    localStorage.setItem('apiKeys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  const updateApiKey = (keyType: keyof ApiKey, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [keyType]: value
    }));
  };

  return { apiKeys, updateApiKey };
};

type ApiKeyManagerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ApiKeyManager = ({ open, onOpenChange }: ApiKeyManagerProps) => {
  const { apiKeys, updateApiKey } = useApiKeys();
  const [tempKeys, setTempKeys] = useState<ApiKey>(apiKeys);

  useEffect(() => {
    if (open) {
      setTempKeys(apiKeys);
    }
  }, [open, apiKeys]);

  const handleSave = () => {
    // Check if any key is missing
    if (!tempKeys.imgbb || !tempKeys.searchApi || !tempKeys.anthropic) {
      toast.error('All API keys are required');
      return;
    }

    updateApiKey('imgbb', tempKeys.imgbb);
    updateApiKey('searchApi', tempKeys.searchApi);
    updateApiKey('anthropic', tempKeys.anthropic);
    
    toast.success('API keys saved successfully');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>API Keys Configuration</DialogTitle>
          <DialogDescription>
            Configure your API keys for image analysis functionality.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="imgbb" className="text-right col-span-1">
              ImgBB
            </Label>
            <Input
              id="imgbb"
              value={tempKeys.imgbb}
              onChange={(e) => setTempKeys({ ...tempKeys, imgbb: e.target.value })}
              placeholder="ImgBB API Key"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="searchApi" className="text-right col-span-1">
              SearchAPI
            </Label>
            <Input
              id="searchApi"
              value={tempKeys.searchApi}
              onChange={(e) => setTempKeys({ ...tempKeys, searchApi: e.target.value })}
              placeholder="SearchAPI Key"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="anthropic" className="text-right col-span-1">
              Anthropic
            </Label>
            <Input
              id="anthropic"
              value={tempKeys.anthropic}
              onChange={(e) => setTempKeys({ ...tempKeys, anthropic: e.target.value })}
              placeholder="Anthropic API Key"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyManager;
