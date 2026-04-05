require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');

const { testConnection } = require('./config/db');
const { migrate }        = require('./config/migrate');
const { seed }           = require('./config/seed');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const authRoutes      = require('./modules/auth/auth.routes');
const usersRoutes     = require('./modules/users/users.routes');
const recordsRoutes   = require('./modules/records/records.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');

const app  = express();
const PORT = process.env.PORT || 3000;

// Security & Parsing
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate Limiting
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later' },
}));

// Health Check 
app.get('/health', (req, res) => res.json({ success: true, message: 'API is running', timestamp: new Date() }));

// Routes
app.use('/api/users',     usersRoutes);
app.use('/api/records',   recordsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Boot
const start = async () => {
  const ok = await testConnection();
  if (!ok) { console.error('Cannot start — DB unavailable'); process.exit(1); }

  app.listen(PORT, () => {
    console.log(`\n🚀 Finance Dashboard API running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV}`);
    console.log(`   Health: http://localhost:${PORT}/health\n`);
  });
};

start();
module.exports = app; 