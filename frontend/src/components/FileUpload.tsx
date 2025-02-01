import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Button, Typography, Paper, useTheme, LinearProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { handleFileValidationError } from '../utils/errorHandling';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  maxFileSize?: number; // in bytes
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect,
  maxFileSize = 10 * 1024 * 1024 // 10MB default
}) => {
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const theme = useTheme();

  const validateAndProcessFile = async (file: File): Promise<boolean> => {
    const validationError = handleFileValidationError(file);
    if (validationError) {
      setError(validationError);
      return false;
    }

    if (file.size > maxFileSize) {
      setError(`File size should not exceed ${maxFileSize / (1024 * 1024)}MB`);
      return false;
    }

    try {
      setIsProcessing(true);
      setUploadProgress(0);

      // Simulate progress for large file processing
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const next = prev + 10;
          return next > 90 ? 90 : next;
        });
      }, 500);

      // Process the file
      onFileSelect(file);
      
      clearInterval(interval);
      setUploadProgress(100);
      setError('');
      return true;
    } catch (err) {
      setError('Error processing file. Please try again.');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      await validateAndProcessFile(file);
    }
  }, [onFileSelect, maxFileSize]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    fileRejections
  } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    disabled: isProcessing,
    maxSize: maxFileSize
  });

  return (
    <Box sx={{ width: '100%', maxWidth: 800, margin: '0 auto' }}>
      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          textAlign: 'center',
          cursor: isProcessing ? 'not-allowed' : 'pointer',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          border: '2px dashed',
          borderColor: error 
            ? 'error.main'
            : isDragActive 
              ? 'primary.main' 
              : 'grey.300',
          borderRadius: 2,
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: isProcessing ? 'grey.300' : 'primary.main',
            bgcolor: isProcessing ? 'background.paper' : 'action.hover'
          },
          opacity: isProcessing ? 0.7 : 1
        }}
      >
        <input {...getInputProps()} disabled={isProcessing} />
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          gap: 2
        }}>
          {isDragActive ? (
            <CloudUploadIcon 
              sx={{ 
                fontSize: 64, 
                color: 'primary.main',
                animation: 'bounce 1s infinite'
              }} 
            />
          ) : (
            <InsertDriveFileIcon 
              sx={{ 
                fontSize: 64, 
                color: error ? 'error.main' : 'primary.main'
              }} 
            />
          )}
          
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 'medium',
              color: error ? 'error.main' : 'text.primary'
            }}
          >
            {isProcessing 
              ? 'Processing file...'
              : isDragActive 
                ? 'Drop the file here' 
                : 'Drag & drop an Excel file here'}
          </Typography>

          {isProcessing && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={uploadProgress} 
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: theme.palette.grey[200],
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    backgroundColor: theme.palette.primary.main,
                  }
                }}
              />
              <Typography 
                variant="caption" 
                color="textSecondary" 
                sx={{ mt: 1 }}
              >
                {uploadProgress}% complete
              </Typography>
            </Box>
          )}

          {!isProcessing && (
            <>
              <Typography 
                variant="body1" 
                color="textSecondary"
                sx={{ mb: 2 }}
              >
                or
              </Typography>

              <Button
                variant="contained"
                component="span"
                disabled={isProcessing}
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
                Browse Files
              </Button>
            </>
          )}

          {error && (
            <Typography 
              variant="caption" 
              color="error" 
              sx={{ 
                mt: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              {error}
            </Typography>
          )}

          <Typography 
            variant="caption" 
            color="textSecondary"
            sx={{
              mt: 2,
              p: 1,
              bgcolor: 'grey.50',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'grey.200'
            }}
          >
            Only .xlsx files up to {maxFileSize / (1024 * 1024)}MB are accepted
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default FileUpload; 