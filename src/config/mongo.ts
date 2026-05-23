import mongoose from 'mongoose';

const connectMongo = async (): Promise<void> => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/nusantaratrail';

  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectMongo;
