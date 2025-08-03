import { supabase } from '../supabase';

// Helper function to generate a unique file name
const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 10);
  const extension = originalName.split('.').pop();
  return `${timestamp}-${randomString}.${extension}`;
};

// Upload a file to Supabase Storage
export const uploadFile = async (
  file: File,
  bucket: string = 'documents',
  folder: string = 'general',
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    // Generate a unique file name to prevent collisions
    const fileName = generateUniqueFileName(file.name);
    const filePath = `${folder}/${fileName}`;
    
    // Log the upload attempt
    console.log('🚀 Uploading file to Supabase Storage:', {
      bucket,
      filePath,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      fileType: file.type
    });

    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('❌ Error uploading file:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from upload');
    }

    // Get the public URL for the file
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    console.log('✅ File uploaded successfully:', urlData.publicUrl);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('❌ Error in file upload process:', error);
    throw error;
  }
};

// Delete a file from Supabase Storage
export const deleteFile = async (
  filePath: string,
  bucket: string = 'documents'
): Promise<void> => {
  try {
    console.log('🗑️ Deleting file from Supabase Storage:', {
      bucket,
      filePath
    });

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('❌ Error deleting file:', error);
      throw error;
    }

    console.log('✅ File deleted successfully');
  } catch (error) {
    console.error('❌ Error in file deletion process:', error);
    throw error;
  }
};

// Create a signed URL for temporary access to a file
export const createSignedUrl = async (
  filePath: string,
  bucket: string = 'documents',
  expiresIn: number = 60 // seconds
): Promise<string> => {
  try {
    console.log('🔗 Creating signed URL:', {
      bucket,
      filePath,
      expiresIn: `${expiresIn} seconds`
    });

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('❌ Error creating signed URL:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from signed URL creation');
    }

    console.log('✅ Signed URL created successfully');
    
    return data.signedUrl;
  } catch (error) {
    console.error('❌ Error in signed URL creation process:', error);
    throw error;
  }
};

// List all files in a bucket/folder
export const listFiles = async (
  bucket: string = 'documents',
  folder: string = ''
): Promise<any[]> => {
  try {
    console.log('📂 Listing files in storage:', {
      bucket,
      folder: folder || 'root'
    });

    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder);

    if (error) {
      console.error('❌ Error listing files:', error);
      throw error;
    }

    console.log(`✅ Found ${data?.length || 0} files`);
    
    return data || [];
  } catch (error) {
    console.error('❌ Error in file listing process:', error);
    throw error;
  }
};