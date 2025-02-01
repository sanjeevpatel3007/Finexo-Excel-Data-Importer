# Finexo Excel Data Importer - Frontend

A modern React-based web application for importing and processing Excel data. Built with Vite, TypeScript, and Material-UI, featuring a clean and intuitive user interface.

## 🚀 Features

- Drag and drop Excel file upload
- Interactive data preview
- Real-time data validation
- Responsive material design
- Error handling and notifications
- Modern UI with Tailwind CSS
- Type-safe development with TypeScript
- Optimized large file handling
- Comprehensive error management
- Extensive test coverage

## 🛠️ Technologies

- React 18
- TypeScript
- Vite
- Material-UI
- Tailwind CSS
- React Dropzone
- React Table
- React Toastify
- Axios for API communication
- XLSX for Excel processing
- Jest and React Testing Library
- React Query for data management
- Web Workers for performance

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager
- Backend service running (see backend README)
- Modern browser with Web Workers support

## 🔧 Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_MAX_FILE_SIZE=50
   VITE_CHUNK_SIZE=1000
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## 📈 Scalability Features

### Large File Handling
- Chunked file reading using Web Workers
- Virtual scrolling for large datasets
- Progressive loading of data
- Memory-efficient data processing

### Performance Optimizations
- React Query for efficient data caching
- Debounced search and filters
- Lazy loading of components
- Optimized re-renders

### Resource Management
- Automatic cleanup of large datasets
- Memory usage monitoring
- Background processing status updates

## 🛡️ Error Handling

### User Input Validation
- File type verification
- File size validation
- Required columns checking
- Data format validation

### UI Error Handling
- Friendly error messages
- Retry mechanisms
- Offline support
- Progress tracking

### Common Error Scenarios
```typescript
export const ErrorTypes = {
  FILE_TOO_LARGE: 'File size exceeds maximum limit',
  INVALID_FORMAT: 'Invalid file format',
  MISSING_COLUMNS: 'Required columns are missing',
  NETWORK_ERROR: 'Network connection error',
  SERVER_ERROR: 'Server processing error',
  VALIDATION_ERROR: 'Data validation failed'
} as const;
```

## 🧪 Testing

### Test Categories

1. **Unit Tests**
   - Component rendering
   - Business logic
   - Utility functions
   - Custom hooks

2. **Integration Tests**
   - File upload flow
   - Data preview functionality
   - Error handling
   - API integration

3. **Test Cases**
   - Empty files
   - Missing columns
   - Invalid data
   - Large files
   - Network errors
   - Concurrent operations

### Example Test
```typescript
describe('FileUpload Component', () => {
  it('handles empty files', async () => {
    render(<FileUpload />);
    const file = new File([], 'empty.xlsx');
    const upload = screen.getByTestId('file-upload');
    
    await userEvent.upload(upload, file);
    
    expect(screen.getByText(/File is empty/i)).toBeInTheDocument();
  });
});
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── utils/          # Utility functions
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API and business logic
│   ├── workers/        # Web Workers
│   ├── tests/          # Test files
│   │   ├── unit/      # Unit tests
│   │   ├── integration/ # Integration tests
│   │   └── fixtures/  # Test data
│   ├── App.tsx         # Main application component
│   ├── main.tsx        # Application entry point
│   └── index.css       # Global styles
├── public/            # Static assets
└── index.html         # HTML template
```

## 🎨 Key Components

- `FileUpload`: Handles Excel file upload with drag and drop
  - Supports large files with chunked processing
  - Validates file format and size
  - Shows upload progress
  
- `DataPreview`: Displays uploaded Excel data in a table format
  - Virtual scrolling for performance
  - Column sorting and filtering
  - Data validation indicators
  
- `ErrorDisplay`: Shows validation errors and notifications
  - Grouped error display
  - Error recovery options
  - Detailed error information

## 🔧 Configuration

The application can be configured through environment variables:

```env
VITE_API_URL=http://localhost:5000 # Backend API URL
VITE_MAX_FILE_SIZE=50 # Maximum file size in MB
VITE_CHUNK_SIZE=1000 # Number of rows per chunk
VITE_ENABLE_WORKERS=true # Enable Web Workers
```

## 🌐 Browser Support

The application supports all modern browsers:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

*Note: Web Workers and other modern features require up-to-date browsers*

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details

## 🙏 Acknowledgments

- Material-UI for the component library
- React community for excellent tools and libraries
- Vite team for the blazing fast build tool
