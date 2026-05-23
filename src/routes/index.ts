import { Router } from 'express';
import {
  AuthController,
  LocationController,
  QRCodeController,
  AudioController,
  ContentController,
  ReviewController,
  VisitController,
  UserController,
} from '../controllers';
import { authenticate, authorize, validate, uploadAudio, uploadImage } from '../middlewares';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  locationSchema,
  reviewSchema,
  audioGuideSchema,
  historicalContentSchema,
} from '../validations';

const router = Router();

// ─── Auth ─────────────────────────────────────────────────────
// #swagger.tags = ['Auth']
router.post('/auth/register', validate(registerSchema), AuthController.register);
router.post('/auth/login', validate(loginSchema), AuthController.login);
router.post('/auth/logout', authenticate, AuthController.logout);
router.post('/auth/refresh', validate(refreshSchema), AuthController.refresh);

// ─── Locations ────────────────────────────────────────────────
// #swagger.tags = ['Locations']
router.get('/locations', LocationController.getAll);
router.get('/locations/:id', LocationController.getById);
router.post('/locations', authenticate, authorize('admin', 'superadmin'), uploadImage, LocationController.create);
router.put('/locations/:id', authenticate, authorize('admin', 'superadmin'), uploadImage, LocationController.update);
router.delete('/locations/:id', authenticate, authorize('admin', 'superadmin'), LocationController.delete);

// ─── QR Codes ─────────────────────────────────────────────────
// #swagger.tags = ['QR Codes']
router.post('/qrcodes/generate/:locationId', authenticate, authorize('admin', 'superadmin'), QRCodeController.generate);
router.get('/qrcodes/scan/:code', QRCodeController.scan);
router.delete('/qrcodes/:id', authenticate, authorize('admin', 'superadmin'), QRCodeController.delete);

// ─── Audio Guide ──────────────────────────────────────────────
// #swagger.tags = ['Audio Guide']
router.get('/audio/:locationId', AudioController.getByLocation);
router.post('/audio', authenticate, authorize('admin', 'superadmin'), uploadAudio, AudioController.upload);
router.put('/audio/:id', authenticate, authorize('admin', 'superadmin'), AudioController.update);
router.delete('/audio/:id', authenticate, authorize('admin', 'superadmin'), AudioController.delete);

// ─── Historical Content ───────────────────────────────────────
// #swagger.tags = ['Historical Content']
router.get('/content/:locationId', ContentController.getByLocation);
router.post('/content', authenticate, authorize('admin', 'superadmin'), validate(historicalContentSchema), ContentController.create);
router.put('/content/:id', authenticate, authorize('admin', 'superadmin'), ContentController.update);
router.delete('/content/:id', authenticate, authorize('admin', 'superadmin'), ContentController.delete);

// ─── Reviews ──────────────────────────────────────────────────
// #swagger.tags = ['Reviews']
router.get('/reviews/:locationId', ReviewController.getByLocation);
router.post('/reviews', authenticate, validate(reviewSchema), ReviewController.create);
router.put('/reviews/:id', authenticate, ReviewController.update);
router.delete('/reviews/:id', authenticate, ReviewController.delete);

// ─── Visit Logs ───────────────────────────────────────────────
// #swagger.tags = ['Visits']
router.post('/visits/log', VisitController.log);
router.get('/visits/stats', authenticate, authorize('admin', 'superadmin'), VisitController.getStats);
router.get('/visits/stats/:locationId', authenticate, authorize('admin', 'superadmin'), VisitController.getStatsByLocation);

// ─── Users (Super Admin) ──────────────────────────────────────
// #swagger.tags = ['Users']
router.get('/users', authenticate, authorize('superadmin'), UserController.getAll);
router.patch('/users/:id/role', authenticate, authorize('superadmin'), UserController.updateRole);
router.patch('/users/:id/active', authenticate, authorize('superadmin'), UserController.toggleActive);

export default router;
