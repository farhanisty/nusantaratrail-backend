import 'dotenv/config';
import app from './app';
import connectMongo from './config/mongo';
import prisma from './config/prisma';

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    // Connect MongoDB
    await connectMongo();

    // Test Prisma / MySQL connection
    await prisma.$connect();
    console.log('✅ MySQL (Prisma) connected');

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`📄 API Docs   at http://localhost:${PORT}/api-docs`);
      console.log(`❤️  Health     at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

start();
