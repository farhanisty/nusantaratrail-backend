import path from 'path';
import fs from 'fs';

const STORAGE_MODE = process.env.STORAGE_MODE || 'local';
const UPLOAD_PATH = process.env.UPLOAD_PATH || './uploads';

export const getFileUrl = (subPath: string, filename: string): string => {
  if (STORAGE_MODE === 'local') {
    return `/uploads/${subPath}/${filename}`;
  }
  return `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${subPath}/${filename}`;
};

export const saveFileLocally = (
  file: Express.Multer.File,
  subPath: string
): string => {
  const dir = path.join(UPLOAD_PATH, subPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filename = `${Date.now()}-${file.originalname}`;
  const dest = path.join(dir, filename);
  fs.renameSync(file.path, dest);
  return filename;
};

export const deleteFile = (subPath: string, filename: string): void => {
  if (STORAGE_MODE === 'local') {
    const filePath = path.join(UPLOAD_PATH, subPath, filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  // GCS delete bisa ditambahkan saat production
};

export { STORAGE_MODE };
