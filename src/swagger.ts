import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'NusantaraTrail API',
    description: 'API dokumentasi Peta Wisata Budaya Interaktif - NusantaraTrail',
    version: '1.0.0',
  },
  host: 'localhost:3000',
  basePath: '/api',
  schemes: ['http', 'https'],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
      description: 'Masukkan token dengan format: Bearer {token}',
    },
  },
  tags: [
    { name: 'Auth', description: 'Autentikasi & otorisasi' },
    { name: 'Locations', description: 'Manajemen lokasi wisata' },
    { name: 'QR Codes', description: 'Generate & scan QR Code' },
    { name: 'Audio Guide', description: 'Upload & kelola audio panduan' },
    { name: 'Historical Content', description: 'Konten sejarah lokasi (MongoDB)' },
    { name: 'Reviews', description: 'Review & rating dari turis' },
    { name: 'Visits', description: 'Log & statistik kunjungan' },
    { name: 'Users', description: 'Manajemen user (Super Admin)' },
  ],
};

const outputFile = './swagger-output.json';
const routes = ['./src/routes/index.ts'];

swaggerAutogen({ openapi: '3.0.0' })(outputFile, routes, doc);
