import  { useState } from 'react';
import { 
  Container, 
  Box, 
  Button, 
  Typography, 
  Alert, 
  Snackbar, 
  Paper,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  useMediaQuery
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import * as XLSX from 'xlsx';
import axios from 'axios';
import FileUpload from './components/FileUpload';
import DataPreview from './components/DataPreview';
import ErrorDisplay from './components/ErrorDisplay';
import { ToastContainer,  } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  handleAxiosError, 
  handleFileValidationError, 
  showErrorToast, 
  showSuccessToast,
  formatValidationErrors,
  validateExcelData,
  validateSheetStructure,
  ValidationError,
  ApiError
} from './utils/errorHandling';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// Configure axios defaults
axios.defaults.withCredentials = true;

// Create axios instance with default config
const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
  headers: {
    'Accept': 'application/json'
  }
});

// Add request interceptor to handle FormData
api.interceptors.request.use((config) => {
  const newConfig = { ...config };
  if (newConfig.data instanceof FormData) {
    // Let the browser set the Content-Type header for FormData
    if (newConfig.headers) {
      delete newConfig.headers['Content-Type'];
    }
  }
  return newConfig;
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

interface SheetData {
  [key: string]: any[];
}

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [sheets, setSheets] = useState<SheetData>({});
  const [errors, setErrors] = useState<{ [key: string]: any[] }>({});
  const [showErrors, setShowErrors] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isValidated, setIsValidated] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const handleFileSelect = async (file: File) => {
    // Validate file first
    const validationError = handleFileValidationError(file);
    if (validationError) {
      showErrorToast(validationError);
      return;
    }

    try {
      setIsLoading(true);
      setActiveStep(0);
      setIsValidated(false);
      setSheets({});
      setErrors({});
      setShowErrors(false);
      setSuccessMessage('');
      setCurrentFile(file);

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { 
            type: 'array',
            cellDates: true,
            dateNF: 'dd/mm/yyyy'
          });

          if (!workbook.SheetNames.length) {
            throw new Error('The Excel file is empty');
          }

          const sheetsData: SheetData = {};
          workbook.SheetNames.forEach((sheetName) => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
              raw: true,
              defval: null
            });

            if (!jsonData.length) {
              throw new Error(`Sheet "${sheetName}" is empty`);
            }

            const processedData = jsonData.map((row: any) => {
              const processedRow = { ...row };
              Object.entries(row).forEach(([key, value]: [string, any]) => {
                if (key === 'Verified') {
                  if (typeof value === 'string') {
                    processedRow[key] = value.toLowerCase().trim() === 'yes';
                  } else if (typeof value === 'boolean') {
                    processedRow[key] = value;
                  } else {
                    processedRow[key] = null;
                  }
                } else if (/date|dt|time/i.test(key)) {
                  if (value) {
                    if (typeof value === 'number') {
                      const date = new Date(Math.round((value - 25569) * 86400 * 1000));
                      processedRow[key] = date.toISOString().split('T')[0];
                    } else if (typeof value === 'string') {
                      const date = new Date(value);
                      if (!isNaN(date.getTime())) {
                        processedRow[key] = date.toISOString().split('T')[0];
                      } else {
                        processedRow[key] = null;
                      }
                    }
                  } else {
                    processedRow[key] = null;
                  }
                }
              });
              return processedRow;
            });

            sheetsData[sheetName] = processedData;
          });

          setSheets(sheetsData);
          setActiveStep(1);
          showSuccessToast('File loaded successfully');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Error processing file';
          showErrorToast(message);
          console.error('File processing error:', error);
        } finally {
          setIsLoading(false);
        }
      };

      reader.onerror = () => {
        showErrorToast('Error reading file');
        setIsLoading(false);
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      setIsLoading(false);
      const message = error instanceof Error ? error.message : 'Error reading file';
      showErrorToast(message);
      console.error('File reading error:', error);
    }
  };

  const handleValidate = async () => {
    if (!currentFile) {
      showErrorToast('Please upload a file first');
      return;
    }

    try {
      setIsLoading(true);

      // Validate sheet structure first
      const structureErrors: { [key: string]: ValidationError[] } = {};
      Object.entries(sheets).forEach(([sheetName, data]) => {
        const errors = validateSheetStructure(data);
        if (errors.length > 0) {
          structureErrors[sheetName] = errors;
        }
      });

      if (Object.keys(structureErrors).length > 0) {
        setErrors(structureErrors);
        setShowErrors(true);
        showErrorToast('Invalid Excel structure. Please check the required columns.');
        return;
      }

      // Validate data
      const dataErrors: { [key: string]: ValidationError[] } = {};
      Object.entries(sheets).forEach(([sheetName, data]) => {
        const errors = validateExcelData(data);
        if (errors.length > 0) {
          dataErrors[sheetName] = errors;
        }
      });

      if (Object.keys(dataErrors).length > 0) {
        setErrors(dataErrors);
        setShowErrors(true);
        showErrorToast('Invalid data found. Please check the error details.');
        return;
      }

      // If local validation passes, send to server
      const formData = new FormData();
      formData.append('file', currentFile, currentFile.name);
      formData.append('sheetsData', JSON.stringify(sheets));
      
      const response = await api.post<{ success: true; message: string } | ApiError>('/api/upload/validate', formData);
      
      if ('success' in response.data && response.data.success) {
        setIsValidated(true);
        setSheets(sheets);
        setActiveStep(2);
        setShowErrors(false);
        setErrors({});
        showSuccessToast('Data validated successfully');
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const apiError = error.response.data;
        if (apiError.errors) {
          // Group errors by sheet
          const errorsBySheet: { [key: string]: any[] } = {};
          apiError.errors.forEach((err: any) => {
            if (!errorsBySheet[err.sheet]) {
              errorsBySheet[err.sheet] = [];
            }
            errorsBySheet[err.sheet].push({
              row: err.row,
              message: err.message
            });
          });
          setErrors(errorsBySheet);
          setShowErrors(true);
          showErrorToast('Validation failed. Please check the error details.');
        } else {
          showErrorToast(apiError.error || 'Validation failed');
        }
      } else {
        showErrorToast('An unexpected error occurred during validation');
      }
      console.error('Validation error details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!isValidated || !currentFile) {
      showErrorToast('Please validate the file before importing');
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post<{ success: true; message: string } | ApiError>('/api/upload/import', null);

      if ('success' in response.data && response.data.success) {
        setSuccessMessage('Data imported successfully');
        showSuccessToast('Data imported successfully');
        // Reset states after successful import
        setSheets({});
        setIsValidated(false);
        setCurrentFile(null);
        setActiveStep(0);
      } else {
        if ('errors' in response.data && response.data.errors) {
          const formattedErrors = formatValidationErrors(response.data.errors);
          setErrors(formattedErrors);
          setShowErrors(true);
          showErrorToast('Some rows contain validation errors. Please check the error details.');
        } else if ('error' in response.data && response.data.error) {
          showErrorToast(response.data.error);
        } else {
          showErrorToast('Failed to import data. Please try again.');
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? handleAxiosError(error as any) : 'Error importing data';
      showErrorToast(errorMessage);
      console.error('Import error details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRow = (sheetName: string, rowIndex: number) => {
    setSheets((prevSheets) => ({
      ...prevSheets,
      [sheetName]: prevSheets[sheetName].filter((_, index) => index !== rowIndex)
    }));
  };

  const steps = [
    { label: 'Upload File', completed: !!currentFile },
    { label: 'Validate Data', completed: isValidated },
    { label: 'Import Data', completed: false }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: 'grey.50',
      py: 4
    }}>
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ 
          p: { xs: 2, md: 4 }, 
          borderRadius: 2,
          bgcolor: 'white'
        }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            align="center"
            sx={{ 
              color: 'primary.main',
              fontWeight: 'bold',
              mb: 4
            }}
          >
            Excel Data Importer
          </Typography>

          <Stepper 
            activeStep={activeStep} 
            alternativeLabel={!isMobile}
            orientation={isMobile ? 'vertical' : 'horizontal'}
            sx={{ mb: 4 }}
          >
            {steps.map((step) => (
              <Step key={step.label} completed={step.completed}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {isLoading && (
            <Box sx={{ width: '100%', mb: 2 }}>
              <LinearProgress />
            </Box>
          )}

          <Box sx={{ 
            mb: 4,
            '& .MuiPaper-root': {
              borderRadius: 2,
              boxShadow: theme.shadows[2]
            }
          }}>
            <FileUpload onFileSelect={handleFileSelect} />
          </Box>

          {Object.keys(sheets).length > 0 && (
            <Box sx={{ 
              mt: 4,
              '& .MuiPaper-root': {
                borderRadius: 2,
                boxShadow: theme.shadows[2]
              }
            }}>
              <DataPreview sheets={sheets} onDeleteRow={handleDeleteRow} />
              
              <Box sx={{ 
                mt: 3, 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 2 
              }}>
                {!isValidated && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleValidate}
                    size="large"
                    disabled={isLoading}
                    startIcon={<CloudUploadIcon />}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 'bold',
                      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                    }}
                  >
                    Validate Data
                  </Button>
                )}
                
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleImport}
                  size="large"
                  disabled={!isValidated || isLoading}
                  startIcon={<SaveAltIcon />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 'bold',
                    '&:not(:disabled)': {
                      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                    }
                  }}
                >
                  Import Data
                </Button>
              </Box>
            </Box>
          )}

          <ErrorDisplay
            open={showErrors}
            onClose={() => setShowErrors(false)}
            errors={errors}
          />

          <Snackbar
            open={!!successMessage}
            autoHideDuration={6000}
            onClose={() => setSuccessMessage('')}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert 
              severity="success" 
              onClose={() => setSuccessMessage('')}
              sx={{ 
                width: '100%',
                borderRadius: 2,
                boxShadow: theme.shadows[3]
              }}
            >
              {successMessage}
            </Alert>
          </Snackbar>

          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </Paper>
      </Container>
    </Box>
  );
}

export default App;