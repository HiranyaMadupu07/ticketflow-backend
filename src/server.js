require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const connectDB = require('./config/db');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/client');
const adminRoutes = require('./routes/admin');
const aiRoutes = require('./routes/ai');
const ticketRoutes = require('./routes/ticket');

const app = express();

/* =========================
   DATABASE
========================= */
connectDB();

/* =========================
   ENSURE UPLOADS DIRECTORY EXISTS
========================= */
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/* =========================
   MIDDLEWARE
========================= */
// CORS Configuration
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(logger);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* =========================
   ROUTES
========================= */
app.use('/api/auth', authRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/tickets', ticketRoutes);

/* =========================
   ERROR HANDLER
========================= */
app.use(errorHandler);

/* =========================
   SERVER START
========================= */
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`✅ TicketFlow backend running on port ${PORT}`);
});
