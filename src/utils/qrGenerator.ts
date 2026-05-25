import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import { Storage } from '@google-cloud/storage';

const STORAGE_MODE = process.env.STORAGE_MODE || 'local';
const UPLOAD_PATH = process.env.UPLOAD_PATH || './uploads';
const BUCKET_NAME = process.env.GCS_BUCKET_NAME || '';

export const generateQRCode = async (
  locationId: number
): Promise<{ code: string; qrImageUrl: string }> => {
  const code = `NTR-${locationId}-${Date.now().toString(36).toUpperCase()}`;
  const filename = `${code}.png`;
  const tempPath = path.join(UPLOAD_PATH, 'temp', filename);

  // Pastikan folder temp ada
  const tempDir = path.join(UPLOAD_PATH, 'temp');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  // Generate QR ke temp file
  await QRCode.toFile(tempPath, code, {
    width: 400,
    margin: 2,
    color: { dark: '#1a0a2e', light: '#ffffff' },
  });

  let qrImageUrl: string;

  if (STORAGE_MODE === 'gcs') {
    // Upload ke GCS
    const gcs = new Storage();
    const bucket = gcs.bucket(BUCKET_NAME);
    const destination = `qrcodes/${filename}`;

    await bucket.upload(tempPath, {
      destination,
      metadata: {
        contentType: 'image/png',
        cacheControl: 'public, max-age=31536000',
      },
    });

    // Hapus temp file
    fs.unlinkSync(tempPath);

    qrImageUrl = `https://storage.googleapis.com/${BUCKET_NAME}/qrcodes/${filename}`;
  } else {
    // Pindah ke folder qrcodes lokal
    const qrDir = path.join(UPLOAD_PATH, 'qrcodes');
    if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });

    const finalPath = path.join(qrDir, filename);
    fs.renameSync(tempPath, finalPath);

    qrImageUrl = `/uploads/qrcodes/${filename}`;
  }

  return { code, qrImageUrl };
};
