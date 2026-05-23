import mongoose, { Schema, Document } from 'mongoose';

// ─── AudioGuide ───────────────────────────────────────────────
export interface IAudioGuide extends Document {
  locationId: number;
  language: 'id' | 'en';
  title: string;
  audioUrl: string;
  durationSeconds: number;
  transcript?: string;
  uploadedBy: number;
  createdAt: Date;
  updatedAt: Date;
}

const AudioGuideSchema = new Schema<IAudioGuide>(
  {
    locationId: { type: Number, required: true, index: true },
    language: { type: String, enum: ['id', 'en'], default: 'id' },
    title: { type: String, required: true },
    audioUrl: { type: String, required: true },
    durationSeconds: { type: Number, default: 0 },
    transcript: { type: String },
    uploadedBy: { type: Number, required: true },
  },
  { timestamps: true }
);

export const AudioGuide = mongoose.model<IAudioGuide>('AudioGuide', AudioGuideSchema);

// ─── HistoricalContent ────────────────────────────────────────
export interface ISection {
  heading: string;
  body: string;
  imageUrl?: string;
}

export interface IHistoricalContent extends Document {
  locationId: number;
  language: 'id' | 'en';
  title: string;
  sections: ISection[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const HistoricalContentSchema = new Schema<IHistoricalContent>(
  {
    locationId: { type: Number, required: true, index: true },
    language: { type: String, enum: ['id', 'en'], default: 'id' },
    title: { type: String, required: true },
    sections: [
      {
        heading: { type: String },
        body: { type: String },
        imageUrl: { type: String },
      },
    ],
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export const HistoricalContent = mongoose.model<IHistoricalContent>(
  'HistoricalContent',
  HistoricalContentSchema
);

// ─── ScanHistory ──────────────────────────────────────────────
export interface IScanHistory extends Document {
  userId?: number;
  qrCode: string;
  locationId: number;
  device?: string;
  coordinates?: { lat: number; lng: number };
  scannedAt: Date;
}

const ScanHistorySchema = new Schema<IScanHistory>({
  userId: { type: Number },
  qrCode: { type: String, required: true },
  locationId: { type: Number, required: true },
  device: { type: String },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number },
  },
  scannedAt: { type: Date, default: Date.now },
});

export const ScanHistory = mongoose.model<IScanHistory>('ScanHistory', ScanHistorySchema);

// ─── TouristInteraction ───────────────────────────────────────
export interface ITouristInteraction extends Document {
  userId?: number;
  locationId: number;
  action: 'play_audio' | 'view_history' | 'share' | 'bookmark';
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

const TouristInteractionSchema = new Schema<ITouristInteraction>({
  userId: { type: Number },
  locationId: { type: Number, required: true },
  action: {
    type: String,
    enum: ['play_audio', 'view_history', 'share', 'bookmark'],
    required: true,
  },
  metadata: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now },
});

export const TouristInteraction = mongoose.model<ITouristInteraction>(
  'TouristInteraction',
  TouristInteractionSchema
);

// ─── OfflineCache ─────────────────────────────────────────────
export interface IOfflineCache extends Document {
  locationId: number;
  cacheKey: string;
  payload: Record<string, unknown>;
  language: 'id' | 'en';
  cachedAt: Date;
  expiresAt: Date;
}

const OfflineCacheSchema = new Schema<IOfflineCache>({
  locationId: { type: Number, required: true, index: true },
  cacheKey: { type: String, required: true, unique: true },
  payload: { type: Schema.Types.Mixed, required: true },
  language: { type: String, enum: ['id', 'en'], default: 'id' },
  cachedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

export const OfflineCache = mongoose.model<IOfflineCache>('OfflineCache', OfflineCacheSchema);
