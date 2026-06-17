const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/veezo';
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
    console.log('MongoDB connected');
    return;
  } catch (error) {
    console.warn('Local MongoDB unavailable, starting in-memory database...');
  }

  const { MongoMemoryServer } = require('mongodb-memory-server');
  const mongod = await MongoMemoryServer.create();
  const memoryUri = mongod.getUri();
  await mongoose.connect(memoryUri);
  console.log('In-memory MongoDB connected (install MongoDB for persistent storage)');
}

module.exports = { connectDB };
