import * as fs from 'fs/promises';
import * as path from 'path';

const getFilerUrl = () => process.env.SEAWEEDFS_FILER_URL;
const getCdnBaseUrl = () => process.env.CDN_BASE_URL || getFilerUrl() || '';
const getLocalFallbackPath = () => process.env.LOGO_STORAGE_PATH || 'public/uploads';

export function isSeaweedFS(): boolean {
  return !!getFilerUrl();
}

export function getUrl(filePath: string): string {
  if (isSeaweedFS()) {
    const baseUrl = getCdnBaseUrl();
    const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
    return `${baseUrl.replace(/\/$/, '')}${cleanPath}`;
  }
  // Local fallback
  return `/uploads/${path.basename(filePath)}`;
}

export async function upload(buffer: Buffer, filename: string, folder?: string): Promise<{ url: string, path: string }> {
  const uploadPath = folder ? `${folder}/${filename}` : filename;
  const cleanUploadPath = uploadPath.startsWith('/') ? uploadPath : `/${uploadPath}`;
  
  if (isSeaweedFS()) {
    const filerUrl = getFilerUrl();
    const url = `${filerUrl?.replace(/\/$/, '')}${cleanUploadPath}`;
    
    const formData = new FormData();
    formData.append('file', new Blob([buffer]), filename);
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`SeaweedFS upload failed: ${response.status} ${response.statusText}`);
    }
    
    return {
      url: getUrl(cleanUploadPath),
      path: cleanUploadPath,
    };
  } else {
    // Local fallback
    const localDir = path.resolve(process.cwd(), getLocalFallbackPath(), folder || '');
    await fs.mkdir(localDir, { recursive: true });
    
    const localPath = path.join(localDir, filename);
    await fs.writeFile(localPath, buffer);
    
    return {
      url: getUrl(cleanUploadPath),
      path: cleanUploadPath,
    };
  }
}

export async function deleteFile(filePath: string): Promise<void> {
  const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
  
  if (isSeaweedFS()) {
    const filerUrl = getFilerUrl();
    const url = `${filerUrl?.replace(/\/$/, '')}${cleanPath}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
    });
    
    if (!response.ok && response.status !== 404) {
      throw new Error(`SeaweedFS delete failed: ${response.status} ${response.statusText}`);
    }
  } else {
    // Local fallback
    const localPath = path.resolve(process.cwd(), getLocalFallbackPath(), filePath.replace(/^\//, ''));
    try {
      await fs.unlink(localPath);
    } catch (err: any) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }
  }
}
