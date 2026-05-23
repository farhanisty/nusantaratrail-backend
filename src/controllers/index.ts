import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import {
  AuthService,
  LocationService,
  QRCodeService,
  AudioService,
  ContentService,
  ReviewService,
  VisitService,
  UserService,
} from '../services';

// ─── Auth Controller ──────────────────────────────────────────
export const AuthController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await AuthService.register(req.body);
      sendSuccess(res, user, 'Registrasi berhasil', 201);
    } catch (e) { next(e); }
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      sendSuccess(res, result, 'Login berhasil');
    } catch (e) { next(e); }
  },

  logout: (req: Request, res: Response) => {
    // Stateless JWT — client hapus token
    sendSuccess(res, null, 'Logout berhasil');
  },

  refresh: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.refresh(refreshToken);
      sendSuccess(res, result, 'Token diperbarui');
    } catch (e) { next(e); }
  },
};

// ─── Location Controller ──────────────────────────────────────
export const LocationController = {
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const category = req.query.category as string | undefined;
      const { locations, total } = await LocationService.getAll(page, limit, category);
      sendPaginated(res, locations, { page, limit, total });
    } catch (e) { next(e); }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const location = await LocationService.getById(parseInt(req.params.id));
      sendSuccess(res, location);
    } catch (e) { next(e); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse number fields from multipart form
      const data = {
        ...req.body,
        latitude: parseFloat(req.body.latitude),
        longitude: parseFloat(req.body.longitude),
      };
      const location = await LocationService.create(data, req.user!.id, req.file);
      sendSuccess(res, location, 'Lokasi berhasil ditambahkan', 201);
    } catch (e) { next(e); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = {
        ...req.body,
        ...(req.body.latitude && { latitude: parseFloat(req.body.latitude) }),
        ...(req.body.longitude && { longitude: parseFloat(req.body.longitude) }),
      };
      const location = await LocationService.update(parseInt(req.params.id), data, req.file);
      sendSuccess(res, location, 'Lokasi berhasil diperbarui');
    } catch (e) { next(e); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await LocationService.delete(parseInt(req.params.id));
      sendSuccess(res, null, 'Lokasi berhasil dihapus');
    } catch (e) { next(e); }
  },
};

// ─── QRCode Controller ────────────────────────────────────────
export const QRCodeController = {
  generate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const qr = await QRCodeService.generate(parseInt(req.params.locationId), req.user!.id);
      sendSuccess(res, qr, 'QR Code berhasil digenerate', 201);
    } catch (e) { next(e); }
  },

  scan: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const location = await QRCodeService.scan(
        req.params.code,
        req.user?.id,
        req.headers['user-agent']
      );
      sendSuccess(res, location, 'QR Code berhasil di-scan');
    } catch (e) { next(e); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await QRCodeService.delete(parseInt(req.params.id));
      sendSuccess(res, null, 'QR Code berhasil dihapus');
    } catch (e) { next(e); }
  },
};

// ─── Audio Controller ─────────────────────────────────────────
export const AudioController = {
  getByLocation: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const audio = await AudioService.getByLocation(parseInt(req.params.locationId));
      sendSuccess(res, audio);
    } catch (e) { next(e); }
  },

  upload: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) { sendError(res, 'File audio wajib diupload', 400); return; }
      const data = {
        ...req.body,
        locationId: parseInt(req.body.locationId),
        durationSeconds: req.body.durationSeconds ? parseInt(req.body.durationSeconds) : 0,
      };
      const audio = await AudioService.upload(data, req.user!.id, req.file);
      sendSuccess(res, audio, 'Audio guide berhasil diupload', 201);
    } catch (e) { next(e); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const audio = await AudioService.update(req.params.id, req.body);
      sendSuccess(res, audio, 'Audio guide berhasil diperbarui');
    } catch (e) { next(e); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await AudioService.delete(req.params.id);
      sendSuccess(res, null, 'Audio guide berhasil dihapus');
    } catch (e) { next(e); }
  },
};

// ─── Content Controller ───────────────────────────────────────
export const ContentController = {
  getByLocation: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { language } = req.query;
      const content = await ContentService.getByLocation(
        parseInt(req.params.locationId),
        language as string | undefined
      );
      sendSuccess(res, content);
    } catch (e) { next(e); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = { ...req.body, locationId: parseInt(req.body.locationId) };
      const content = await ContentService.create(data);
      sendSuccess(res, content, 'Konten sejarah berhasil ditambahkan', 201);
    } catch (e) { next(e); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const content = await ContentService.update(req.params.id, req.body);
      sendSuccess(res, content, 'Konten sejarah berhasil diperbarui');
    } catch (e) { next(e); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await ContentService.delete(req.params.id);
      sendSuccess(res, null, 'Konten sejarah berhasil dihapus');
    } catch (e) { next(e); }
  },
};

// ─── Review Controller ────────────────────────────────────────
export const ReviewController = {
  getByLocation: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await ReviewService.getByLocation(parseInt(req.params.locationId));
      sendSuccess(res, result);
    } catch (e) { next(e); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const review = await ReviewService.create({ ...req.body, userId: req.user!.id });
      sendSuccess(res, review, 'Review berhasil ditambahkan', 201);
    } catch (e) { next(e); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isAdmin = ['admin', 'superadmin'].includes(req.user!.role);
      const review = await ReviewService.update(parseInt(req.params.id), req.user!.id, req.body, isAdmin);
      sendSuccess(res, review, 'Review berhasil diperbarui');
    } catch (e) { next(e); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isAdmin = ['admin', 'superadmin'].includes(req.user!.role);
      await ReviewService.delete(parseInt(req.params.id), req.user!.id, isAdmin);
      sendSuccess(res, null, 'Review berhasil dihapus');
    } catch (e) { next(e); }
  },
};

// ─── Visit Controller ─────────────────────────────────────────
export const VisitController = {
  log: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const log = await VisitService.log({
        ...req.body,
        userId: req.user?.id,
        ipAddress: req.ip,
        deviceInfo: req.headers['user-agent'],
      });
      sendSuccess(res, log, 'Kunjungan tercatat', 201);
    } catch (e) { next(e); }
  },

  getStats: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await VisitService.getStats();
      sendSuccess(res, stats);
    } catch (e) { next(e); }
  },

  getStatsByLocation: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await VisitService.getStatsByLocation(parseInt(req.params.locationId));
      sendSuccess(res, stats);
    } catch (e) { next(e); }
  },
};

// ─── User Controller ──────────────────────────────────────────
export const UserController = {
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await UserService.getAll();
      sendSuccess(res, users);
    } catch (e) { next(e); }
  },

  updateRole: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await UserService.updateRole(parseInt(req.params.id), req.body.role);
      sendSuccess(res, user, 'Role berhasil diperbarui');
    } catch (e) { next(e); }
  },

  toggleActive: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await UserService.toggleActive(parseInt(req.params.id), req.body.isActive);
      sendSuccess(res, user, 'Status akun berhasil diperbarui');
    } catch (e) { next(e); }
  },
};
