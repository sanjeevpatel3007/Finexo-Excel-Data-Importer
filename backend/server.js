require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const upload = require('./middleware/fileValidation.middleware');
const uploadController = require('./controllers/upload.controller');
const dbConfig = require('./config/db.config');

const app = express();
const PORT = process.env.PORT || 3000;

// Increase payload limit for large files
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Configure mongoose for better performance
mongoose.set('strictQuery', false);
mongoose.set('bufferCommands', false); // Disable mongoose buffering
mongoose.set('autoIndex', false); // Disable automatic index creation in production

// Database connection with retry logic and optimized settings
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(dbConfig.mongoUri, {
      ...dbConfig.options,
      serverSelectionTimeoutMS: 5000,
      retryWrites: true,
      maxPoolSize: 100, // Increase connection pool for concurrent operations
      wtimeoutMS: 30000, // Increase write timeout for large operations
      socketTimeoutMS: 45000, // Increase socket timeout
      keepAlive: true,
      keepAliveInitialDelay: 300000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log('Database connection successful! Backend is ready to use.');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

// Connect to MongoDB
connectDB();

// Routes
app.post('/api/upload/validate', 
  upload.single('file'), 
  uploadController.validateFile
);

app.post('/api/upload/import', 
  uploadController.importData
);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    dbConnection: mongoose.connection.readyState === 1
  });
});

// Enhanced error handling middleware with detailed error responses
app.use((err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: err.errors
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      error: 'Duplicate Entry',
      details: err.keyValue
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    requestId: req.id
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 