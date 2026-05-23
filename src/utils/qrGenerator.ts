import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export const generateQRCode = async (locationId: number): Promise<{ code: string; filename: string }> => {
  const code = `NTR-${locationId}-${uuidv4().split('-')[0].toUpperCase()}`;
  const filename = `${code}.png`;

  const uploadPath = process.env.UPLOAD_PATH || './uploads';
  const dir = path.join(uploadPath, 'qrcodes');

  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, filename);
  await QRCode.toFile(filePath, code, {
    width: 300,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
  });

  return { code, filename };
};
