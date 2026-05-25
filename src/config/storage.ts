import path from 'path';
import fs from 'fs';
import { Storage } from '@google-cloud/storage';

const STORAGE_MODE = process.env.STORAGE_MODE || 'local';
const UPLOAD_PATH = process.env.UPLOAD_PATH || './uploads';
const BUCKET_NAME = process.env.GCS_BUCKET_NAME || '';

// Init GCS client (hanya aktif kalau STORAGE_MODE=gcs)
const gcs = STORAGE_MODE === 'gcs' ? new Storage() : null;
const bucket = gcs ? gcs.bucket(BUCKET_NAME) : null;

// ─── Upload File ──────────────────────────────────────────────
export const uploadFile = async (
  file: Express.Multer.File,
  subPath: string
): Promise<string> => {
  if (STORAGE_MODE === 'gcs') {
    return uploadToGCS(file, subPath);
  }
  return uploadToLocal(file, subPath);
};

// ─── Delete File ──────────────────────────────────────────────
export const deleteFile = async (fileUrl: string): Promise<void> => {
  if (STORAGE_MODE === 'gcs') {
    await deleteFromGCS(fileUrl);
  } else {
    deleteFromLocal(fileUrl);
  }
};

// ─── Get Public URL ───────────────────────────────────────────
export const getPublicUrl = (subPath: string, filename: string): string => {
  if (STORAGE_MODE === 'gcs') {
    return `https://storage.googleapis.com/${BUCKET_NAME}/${subPath}/${filename}`;
  }
  return `/uploads/${subPath}/${filename}`;
};

// ─── Local Implementation ─────────────────────────────────────
const uploadToLocal = (file: Express.Multer.File, subPath: string): string => {
  const dir = path.join(UPLOAD_PATH, subPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
  const dest = path.join(dir, filename);
  fs.renameSync(file.path, dest);

  return getPublicUrl(subPath, filename);
};

const deleteFromLocal = (fileUrl: string): void => {
  // Extract path dari URL: /uploads/images/filename.jpg
  const relativePath = fileUrl.replace('/uploads/', '');
  const filePath = path.join(UPLOAD_PATH, relativePath);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};

// ─── GCS Implementation ───────────────────────────────────────
const uploadToGCS = async (
  file: Express.Multer.File,
  subPath: string
): Promise<string> => {
  if (!bucket) throw new Error('GCS bucket tidak terkonfigurasi');

  const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
  const destination = `${subPath}/${filename}`;

  await bucket.upload(file.path, {
    destination,
    metadata: {
      contentType: file.mimetype,
      cacheControl: 'public, max-age=31536000',
    },
  });

  // Hapus temp file setelah upload
  if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

  return getPublicUrl(subPath, filename);
};

const deleteFromGCS = async (fileUrl: string): Promise<void> => {
  if (!bucket) return;

  // Extract GCS object path dari URL
  // URL: https://storage.googleapis.com/bucket-name/images/file.jpg
  // Object: images/file.jpg
  const urlPrefix = `https://storage.googleapis.com/${BUCKET_NAME}/`;
  const objectName = fileUrl.replace(urlPrefix, '');

  try {
    await bucket.file(objectName).delete();
  } catch (err) {
    console.warn('Gagal hapus file dari GCS:', err);
  }
};

export { STORAGE_MODE };
