const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const dotenv = require('dotenv');
const { connectDB } = require('./db/connection');
const { seedDatabase } = require('./db/seed');
const { UPLOADS_DIR } = require('./middleware/upload');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');
const checkoutRoutes = require('./routes/checkout');
const { toProductJSON } = require('./utils/serialize');
const Product = require('./models/Product');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: true, credentials: true }));
app.use(compression());
app.use(morgan('dev'));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(UPLOADS_DIR));

app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/checkout', checkoutRoutes);

async function start() {
  try {
    await connectDB();
    await seedDatabase();
    app.listen(PORT, () => {
      console.log(`VEEZO backend running on port ${PORT}`);
      console.log('Cash on delivery checkout enabled');
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    console.error('Make sure MongoDB is running: mongodb://127.0.0.1:27017/veezo');
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

module.exports = { app, start, toProductJSON, Product };
