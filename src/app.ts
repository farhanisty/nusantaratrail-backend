import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { errorHandler } from './middlewares';
import routes from './routes';

const app = express();

// ─── Security & Parsing ───────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Static Files (uploads lokal) ────────────────────────────
const uploadPath = process.env.UPLOAD_PATH || './uploads';
app.use('/uploads', express.static(path.resolve(uploadPath)));

// ─── Swagger UI ───────────────────────────────────────────────
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const swaggerOutput = require('./swagger-output.json');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerOutput));
  console.log('📄 Swagger UI: http://localhost:3000/api-docs');
} catch (err) {
  console.log(err);
  console.log('⚠️  swagger-output.json belum ada. Jalankan: npm run swagger');
}

// ─── Routes ───────────────────────────────────────────────────
app.use('/api', routes);

// ─── Health Check ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Route tidak ditemukan' });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use(errorHandler);

export default app;
