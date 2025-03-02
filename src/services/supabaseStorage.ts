
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export const uploadImageToSupabase = async (imageFile: File): Promise<string> => {
  const fileExt = imageFile.name.split('.').pop();
  const filePath = `${uuidv4()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('images')
    .upload(filePath, imageFile);
    
  if (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
  
  const { data: publicUrlData } = supabase.storage
    .from('images')
    .getPublicUrl(filePath);
    
  return publicUrlData.publicUrl;
};

export const getImagePublicUrl = (path: string): string => {
  const { data } = supabase.storage
    .from('images')
    .getPublicUrl(path);
    
  return data.publicUrl;
};
