import path from 'path';
import dotenv from 'dotenv';

// Charger les variables d'environnement depuis le dossier racine du backend
dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });

export const config = {
  database: {
    url: process.env.DATABASE_URL || 'postgresql://louma_user:password@localhost:5432/louma_db',
  },
  server: {
    port: parseInt(process.env.PORT || '5000'),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
  },
  cors: {
    origins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8081', 'http://localhost:3000'],
  },
};

// Validation des configurations requises
if (!config.database.url) {
  throw new Error('DATABASE_URL is required');
}

if (!config.jwt.secret) {
  throw new Error('JWT_SECRET is required');
}

export default config;
