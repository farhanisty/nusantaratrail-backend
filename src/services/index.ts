import bcrypt from 'bcryptjs';
import slugify from '../utils/slugify';
import { AppError } from '../utils/AppError';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { generateQRCode } from '../utils/qrGenerator';
import { uploadFile } from '../config/storage';
import {
  UserRepository,
  LocationRepository,
  QRCodeRepository,
  ReviewRepository,
  VisitLogRepository,
} from '../repositories';
import { AudioGuide, HistoricalContent, ScanHistory } from '../models/mongo';
import { Category, Role } from '@prisma/client';

// ─── Auth Service ─────────────────────────────────────────────
export const AuthService = {
  register: async (data: { name: string; email: string; password: string; phone?: string }) => {
    const existing = await UserRepository.findByEmail(data.email);
    if (existing) throw new AppError('Email sudah terdaftar', 409);

    const hashed = await bcrypt.hash(data.password, 10);
    const user = await UserRepository.create({ ...data, password: hashed });
    const { password: _, ...userWithoutPass } = user;
    return userWithoutPass;
  },

  login: async (email: string, password: string) => {
    const user = await UserRepository.findByEmail(email);
    if (!user) throw new AppError('Email atau password salah', 401);
    if (!user.isActive) throw new AppError('Akun tidak aktif', 403);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError('Email atau password salah', 401);

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const { password: _, ...userWithoutPass } = user;
    return { user: userWithoutPass, accessToken, refreshToken };
  },

  refresh: async (refreshToken: string) => {
    try {
      const payload = verifyRefreshToken(refreshToken);
      const user = await UserRepository.findById(payload.id);
      if (!user) throw new AppError('User tidak ditemukan', 404);

      const newAccessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
      return { accessToken: newAccessToken };
    } catch {
      throw new AppError('Refresh token tidak valid', 401);
    }
  },
};

// ─── Location Service ─────────────────────────────────────────
export const LocationService = {
  getAll: async (page = 1, limit = 10, category?: string) => {
    const skip = (page - 1) * limit;
    const cat = category as Category | undefined;
    const [locations, total] = await Promise.all([
      LocationRepository.findAll({ skip, take: limit, category: cat }),
      LocationRepository.count(cat),
    ]);
    return { locations, total };
  },

  getById: async (id: number) => {
    const location = await LocationRepository.findById(id);
    if (!location) throw new AppError('Lokasi tidak ditemukan', 404);
    return location;
  },

  create: async (
    data: { name: string; description?: string; address?: string; latitude: number; longitude: number; category: string },
    createdBy: number,
    imageFile?: Express.Multer.File
  ) => {
    const slug = slugify(data.name);
    const existing = await LocationRepository.findBySlug(slug);
    if (existing) throw new AppError('Nama lokasi sudah ada', 409);

    let coverImage: string | undefined;
    if (imageFile) {
      coverImage = await uploadFile(imageFile, 'images');
    }

    return LocationRepository.create({
      ...data,
      slug,
      category: data.category as Category,
      coverImage,
      createdBy,
    });
  },

  update: async (
    id: number,
    data: Partial<{ name: string; description: string; address: string; latitude: number; longitude: number; category: string }>,
    imageFile?: Express.Multer.File
  ) => {
    const location = await LocationRepository.findById(id);
    if (!location) throw new AppError('Lokasi tidak ditemukan', 404);

    let coverImage: string | undefined;
    if (imageFile) {
      coverImage = await uploadFile(imageFile, 'images');
    }

    return LocationRepository.update(id, { ...data, ...(coverImage && { coverImage }) } as any);
  },

  delete: async (id: number) => {
    const location = await LocationRepository.findById(id);
    if (!location) throw new AppError('Lokasi tidak ditemukan', 404);
    return LocationRepository.delete(id);
  },
};

// ─── QRCode Service ───────────────────────────────────────────
export const QRCodeService = {
  generate: async (locationId: number, generatedBy: number) => {
    const location = await LocationRepository.findById(locationId);
    if (!location) throw new AppError('Lokasi tidak ditemukan', 404);

    const { code, qrImageUrl } = await generateQRCode(locationId);

    return QRCodeRepository.create({ locationId, code, qrImageUrl, generatedBy });
  },

  scan: async (code: string, userId?: number, deviceInfo?: string) => {
    const qr = await QRCodeRepository.findByCode(code);
    if (!qr || !qr.isActive) throw new AppError('QR Code tidak valid', 404);

    // Simpan scan history ke MongoDB
    await ScanHistory.create({ userId, qrCode: code, locationId: qr.locationId, device: deviceInfo });

    // Catat visit log ke MySQL
    await VisitLogRepository.create({ locationId: qr.locationId, qrCodeId: qr.id, userId });

    return qr.location;
  },

  delete: async (id: number) => {
    const qr = await QRCodeRepository.findById(id);
    if (!qr) throw new AppError('QR Code tidak ditemukan', 404);
    return QRCodeRepository.delete(id);
  },
};

// ─── Audio Guide Service ──────────────────────────────────────
export const AudioService = {
  getByLocation: async (locationId: number) => {
    return AudioGuide.find({ locationId }).sort({ createdAt: -1 });
  },

  upload: async (
    data: { locationId: number; language: 'id' | 'en'; title: string; durationSeconds?: number; transcript?: string },
    uploadedBy: number,
    audioFile: Express.Multer.File
  ) => {
    const location = await LocationRepository.findById(data.locationId);
    if (!location) throw new AppError('Lokasi tidak ditemukan', 404);

    const audioUrl = await uploadFile(audioFile, 'audio');

    return AudioGuide.create({ ...data, audioUrl, uploadedBy });
  },

  update: async (
    id: string,
    data: Partial<{ title: string; language: string; transcript: string; durationSeconds: number }>
  ) => {
    const audio = await AudioGuide.findByIdAndUpdate(id, data, { new: true });
    if (!audio) throw new AppError('Audio guide tidak ditemukan', 404);
    return audio;
  },

  delete: async (id: string) => {
    const audio = await AudioGuide.findByIdAndDelete(id);
    if (!audio) throw new AppError('Audio guide tidak ditemukan', 404);
    return audio;
  },
};

// ─── Historical Content Service ───────────────────────────────
export const ContentService = {
  getByLocation: async (locationId: number, language?: string) => {
    return HistoricalContent.find({ locationId, ...(language && { language }) });
  },

  create: async (data: {
    locationId: number;
    language: 'id' | 'en';
    title: string;
    sections: any[];
    tags?: string[];
  }) => {
    const location = await LocationRepository.findById(data.locationId);
    if (!location) throw new AppError('Lokasi tidak ditemukan', 404);
    return HistoricalContent.create(data);
  },

  update: async (id: string, data: any) => {
    const content = await HistoricalContent.findByIdAndUpdate(id, data, { new: true });
    if (!content) throw new AppError('Konten tidak ditemukan', 404);
    return content;
  },

  delete: async (id: string) => {
    const content = await HistoricalContent.findByIdAndDelete(id);
    if (!content) throw new AppError('Konten tidak ditemukan', 404);
    return content;
  },
};

// ─── Review Service ───────────────────────────────────────────
export const ReviewService = {
  getByLocation: async (locationId: number) => {
    const [reviews, avg] = await Promise.all([
      ReviewRepository.findByLocation(locationId),
      ReviewRepository.avgRating(locationId),
    ]);
    return { reviews, avgRating: avg._avg.rating, totalReviews: avg._count };
  },

  create: async (data: { locationId: number; userId: number; rating: number; comment?: string }) => {
    const existing = await ReviewRepository.findByUserAndLocation(data.userId, data.locationId);
    if (existing) throw new AppError('Kamu sudah memberikan review untuk lokasi ini', 409);
    return ReviewRepository.create(data);
  },

  update: async (
    id: number,
    userId: number,
    data: { rating?: number; comment?: string },
    isAdmin: boolean
  ) => {
    const review = await ReviewRepository.findById(id);
    if (!review) throw new AppError('Review tidak ditemukan', 404);
    if (!isAdmin && review.userId !== userId) throw new AppError('Akses ditolak', 403);
    return ReviewRepository.update(id, data);
  },

  delete: async (id: number, userId: number, isAdmin: boolean) => {
    const review = await ReviewRepository.findById(id);
    if (!review) throw new AppError('Review tidak ditemukan', 404);
    if (!isAdmin && review.userId !== userId) throw new AppError('Akses ditolak', 403);
    return ReviewRepository.delete(id);
  },
};

// ─── Visit Service ────────────────────────────────────────────
export const VisitService = {
  log: async (data: {
    locationId: number;
    qrCodeId: number;
    userId?: number;
    deviceInfo?: string;
    ipAddress?: string;
  }) => {
    return VisitLogRepository.create(data);
  },

  getStats: async () => {
    const [total, byLocation] = await Promise.all([
      VisitLogRepository.countAll(),
      VisitLogRepository.statsAll(),
    ]);
    return { total, byLocation };
  },

  getStatsByLocation: async (locationId: number) => {
    const [total, recent] = await Promise.all([
      VisitLogRepository.countByLocation(locationId),
      VisitLogRepository.recentByLocation(locationId),
    ]);
    return { total, recent };
  },
};

// ─── User Service ─────────────────────────────────────────────
export const UserService = {
  getAll: () => UserRepository.findAll(),

  updateRole: async (id: number, role: string) => {
    const user = await UserRepository.findById(id);
    if (!user) throw new AppError('User tidak ditemukan', 404);
    return UserRepository.updateRole(id, role as Role);
  },

  toggleActive: async (id: number, isActive: boolean) => {
    const user = await UserRepository.findById(id);
    if (!user) throw new AppError('User tidak ditemukan', 404);
    return UserRepository.toggleActive(id, isActive);
  },
};
