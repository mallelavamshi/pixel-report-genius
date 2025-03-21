
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type ApiKey = {
  imgbb: string;
  searchApi: string;
  anthropic: string;
};

// Default API keys for testing - these will only be visible to admin users
const DEFAULT_API_KEYS: ApiKey = {
  imgbb: '18759606ef63e6db0fc6bd73afc2b1c7',
  searchApi: 'KLyAAKTXMr1ry36GSbpp1u7M',
  anthropic: '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'
};

export const useApiKeys = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey>(() => {
    const savedKeys = localStorage.getItem('apiKeys');
    return savedKeys ? JSON.parse(savedKeys) : DEFAULT_API_KEYS;
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

  // Helper to get masked API keys for non-admin users
  const getMaskedApiKeys = () => {
    const masked: ApiKey = { ...apiKeys };
    for (const key in masked) {
      const value = masked[key as keyof ApiKey];
      if (value && value.length > 8) {
        masked[key as keyof ApiKey] = `${value.slice(0, 4)}...${value.slice(-4)}`;
      }
    }
    return masked;
  };

  // Check if API keys are configured
  const areApiKeysConfigured = () => {
    return !!(apiKeys.imgbb && apiKeys.searchApi && apiKeys.anthropic);
  };

  return { apiKeys, updateApiKey, getMaskedApiKeys, areApiKeysConfigured };
};

type ApiKeyManagerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adminMode?: boolean;  // New prop to determine if admin is viewing
};

const ApiKeyManager = ({ open, onOpenChange, adminMode = false }: ApiKeyManagerProps) => {
  const { apiKeys, updateApiKey, getMaskedApiKeys } = useApiKeys();
  const { isAdmin } = useAuth();
  const [tempKeys, setTempKeys] = useState<ApiKey>(isAdmin ? apiKeys : getMaskedApiKeys());

  useEffect(() => {
    if (open) {
      // If the user is not an admin, they should only see masked keys
      // If they are an admin, they can see and edit the actual keys
      setTempKeys(isAdmin ? apiKeys : getMaskedApiKeys());
    }
  }, [open, apiKeys, isAdmin]);

  const handleSave = () => {
    // If not an admin user, don't allow saving
    if (!isAdmin) {
      toast.error('Only administrators can change API keys');
      onOpenChange(false);
      return;
    }

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
            {isAdmin 
              ? 'Configure API keys for image analysis functionality.'
              : 'View the API keys configuration. Only administrators can modify these keys.'}
          </DialogDescription>
        </DialogHeader>

        {!isAdmin && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800 mb-4 flex items-start">
            <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 text-amber-500" />
            <p className="text-sm">
              API keys are managed by administrators. Please contact an administrator if you need changes.
            </p>
          </div>
        )}

        <div className="grid gap-4 py-4">
          {isAdmin ? (
            // Admin view - shows full keys and allows editing
            <>
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
            </>
          ) : (
            // Non-admin view - shows message that keys are managed by admins
            <div className="p-4 bg-gray-50 rounded-md text-center">
              <p className="text-gray-600">
                API keys are configured and managed by administrators.
              </p>
              <p className="text-gray-500 text-sm mt-2">
                These keys are required for image analysis functionality.
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          {isAdmin ? (
            <Button type="submit" onClick={handleSave}>Save changes</Button>
          ) : (
            <Button type="button" onClick={() => onOpenChange(false)}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyManager;
