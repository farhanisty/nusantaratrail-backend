import prisma from '../config/prisma';
import { User, Location, QRCode, Review, VisitLog, Role, Category } from '@prisma/client';

// Helper select user tanpa password
const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  phone: true,
  avatarUrl: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

// ─── User Repository ──────────────────────────────────────────
export const UserRepository = {
  findAll: () => prisma.user.findMany({ select: userSelect }),

  findById: (id: number) =>
    prisma.user.findUnique({ where: { id }, select: userSelect }),

  findByEmail: (email: string) =>
    prisma.user.findUnique({ where: { email } }),

  create: (data: { name: string; email: string; password: string; role?: Role; phone?: string }) =>
    prisma.user.create({ data }),

  update: (id: number, data: Partial<User>) =>
    prisma.user.update({ where: { id }, data, select: userSelect }),

  updateRole: (id: number, role: Role) =>
    prisma.user.update({ where: { id }, data: { role }, select: userSelect }),

  toggleActive: (id: number, isActive: boolean) =>
    prisma.user.update({ where: { id }, data: { isActive }, select: userSelect }),

  delete: (id: number) => prisma.user.delete({ where: { id } }),
};

// ─── Location Repository ──────────────────────────────────────
export const LocationRepository = {
  findAll: (params?: { skip?: number; take?: number; category?: Category }) =>
    prisma.location.findMany({
      where: {
        isActive: true,
        ...(params?.category && { category: params.category }),
      },
      skip: params?.skip,
      take: params?.take,
      include: { user: { select: userSelect } },
      orderBy: { createdAt: 'desc' },
    }),

  count: (category?: Category) =>
    prisma.location.count({ where: { isActive: true, ...(category && { category }) } }),

  findById: (id: number) =>
    prisma.location.findUnique({
      where: { id },
      include: {
        user: { select: userSelect },
        reviews: { include: { user: { select: userSelect } } },
        qrCodes: true,
      },
    }),

  findBySlug: (slug: string) =>
    prisma.location.findUnique({ where: { slug } }),

  create: (data: {
    name: string;
    slug: string;
    description?: string;
    address?: string;
    latitude: number;
    longitude: number;
    category: Category;
    coverImage?: string;
    createdBy: number;
  }) => prisma.location.create({ data }),

  update: (id: number, data: Partial<Location>) =>
    prisma.location.update({ where: { id }, data }),

  delete: (id: number) =>
    prisma.location.update({ where: { id }, data: { isActive: false } }),
};

// ─── QRCode Repository ────────────────────────────────────────
export const QRCodeRepository = {
  findByCode: (code: string) =>
    prisma.qRCode.findUnique({
      where: { code },
      include: { location: true },
    }),

  findByLocation: (locationId: number) =>
    prisma.qRCode.findMany({ where: { locationId, isActive: true } }),

  findById: (id: number) => prisma.qRCode.findUnique({ where: { id } }),

  create: (data: { locationId: number; code: string; qrImageUrl?: string; generatedBy: number }) =>
    prisma.qRCode.create({ data }),

  deactivate: (id: number) =>
    prisma.qRCode.update({ where: { id }, data: { isActive: false } }),

  delete: (id: number) => prisma.qRCode.delete({ where: { id } }),
};

// ─── Review Repository ────────────────────────────────────────
export const ReviewRepository = {
  findByLocation: (locationId: number) =>
    prisma.review.findMany({
      where: { locationId },
      include: { user: { select: userSelect } },
      orderBy: { createdAt: 'desc' },
    }),

  findById: (id: number) => prisma.review.findUnique({ where: { id } }),

  findByUserAndLocation: (userId: number, locationId: number) =>
    prisma.review.findFirst({ where: { userId, locationId } }),

  create: (data: { locationId: number; userId: number; rating: number; comment?: string }) =>
    prisma.review.create({ data }),

  update: (id: number, data: { rating?: number; comment?: string }) =>
    prisma.review.update({ where: { id }, data }),

  delete: (id: number) => prisma.review.delete({ where: { id } }),

  avgRating: (locationId: number) =>
    prisma.review.aggregate({
      where: { locationId },
      _avg: { rating: true },
      _count: true,
    }),
};

// ─── VisitLog Repository ──────────────────────────────────────
export const VisitLogRepository = {
  create: (data: {
    locationId: number;
    qrCodeId: number;
    userId?: number;
    deviceInfo?: string;
    ipAddress?: string;
  }) => prisma.visitLog.create({ data }),

  countAll: () => prisma.visitLog.count(),

  countByLocation: (locationId: number) =>
    prisma.visitLog.count({ where: { locationId } }),

  statsAll: () =>
    prisma.visitLog.groupBy({
      by: ['locationId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    }),

  statsByLocation: (locationId: number) =>
    prisma.visitLog.groupBy({
      by: ['locationId'],
      where: { locationId },
      _count: { id: true },
    }),

  recentByLocation: (locationId: number, take = 10) =>
    prisma.visitLog.findMany({
      where: { locationId },
      take,
      orderBy: { scannedAt: 'desc' },
    }),
};
