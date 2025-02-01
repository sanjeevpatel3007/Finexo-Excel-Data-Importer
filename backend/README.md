# Finexo Excel Data Importer - Backend

This is the backend service for the Finexo Excel Data Importer application, built with Node.js and Express.js. It handles Excel file processing, data validation, and database operations.

## 🚀 Features

- Excel file upload and processing
- Data validation and transformation
- RESTful API endpoints
- MongoDB integration
- Error handling and logging
- CORS support
- File upload handling with Multer
- Scalable processing of large Excel files
- Comprehensive error handling
- Extensive test coverage

## 🛠️ Technologies

- Node.js
- Express.js
- MongoDB/Mongoose
- XLSX for Excel processing
- Multer for file uploads
- CORS for cross-origin resource sharing
- dotenv for environment variable management
- Jest for testing
- Stream processing for large files

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB installed and running
- npm or yarn package manager
- Minimum 4GB RAM recommended for large file processing

## 🔧 Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the root directory and add your configuration:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   MAX_FILE_SIZE=50mb
   CHUNK_SIZE=1000
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Running Tests
```bash
npm test
```

## 📚 API Endpoints

- `POST /api/upload` - Upload Excel file
  - Supports files up to 50MB (configurable)
  - Streams data processing for large files
  - Returns detailed validation results
- `GET /api/status/:jobId` - Check processing status
- `GET /api/validation/:fileId` - Get validation results

## 🔒 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
MAX_FILE_SIZE=50mb
CHUNK_SIZE=1000
ENABLE_DETAILED_LOGGING=true
```

## 📈 Scalability Features

- **Streaming File Processing**
  - Uses Node.js streams to handle large files efficiently
  - Processes data in chunks to minimize memory usage
  - Configurable chunk size for optimization

- **Database Optimization**
  - Implements MongoDB indexing for faster queries
  - Batch processing for bulk insertions
  - Cursor-based pagination for large datasets

- **Resource Management**
  - Configurable memory limits
  - Automatic cleanup of temporary files
  - Background job processing for large files

## 🛡️ Error Handling

### File Validation
- File size limits
- File format verification
- Required columns validation
- Data type validation per column

### Runtime Error Handling
- Graceful handling of database connection issues
- Automatic retry mechanisms for failed operations
- Detailed error logging with stack traces

### Common Error Scenarios
```javascript
{
  "INVALID_FILE_FORMAT": "File must be a valid .xlsx document",
  "MISSING_REQUIRED_COLUMNS": "Required columns are missing: [column names]",
  "INVALID_DATA_FORMAT": "Invalid data format in row [X], column [Y]",
  "FILE_TOO_LARGE": "File exceeds maximum size limit",
  "PROCESSING_ERROR": "Error processing file: [detailed message]"
}
```

## 🧪 Testing

### Test Categories
1. **Unit Tests**
   - Individual function testing
   - Service layer validation
   - Error handling verification

2. **Integration Tests**
   - API endpoint testing
   - Database operations
   - File processing workflows

3. **Test Cases**
   - Empty files
   - Missing mandatory columns
   - Invalid data formats
   - Large files (stress testing)
   - Concurrent uploads

### Running Tests
```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --grep "File Upload"

# Run with coverage
npm run test:coverage
```

## 📁 Project Structure

```
backend/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/        # Database models
├── services/      # Business logic
├── utils/         # Utility functions
├── tests/         # Test files
│   ├── unit/      # Unit tests
│   ├── integration/ # Integration tests
│   └── fixtures/  # Test data
└── server.js      # Application entry point
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details 