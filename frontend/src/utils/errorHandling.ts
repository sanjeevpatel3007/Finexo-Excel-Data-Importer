import { AxiosError } from 'axios';
import { toast } from 'react-toastify';

export interface ValidationError {
  row: number;
  column?: string;
  message: string;
  sheetName?: string;
  severity?: 'error' | 'warning' | 'info';
}

export interface ApiError {
  success: false;
  error?: string;
  errors?: ValidationError[];
  message?: string;
  code?: string;
  details?: any;
}

export interface ExcelRow {
  Name: string;
  Amount: number;
  Date: string;
  Verified: boolean;
  [key: string]: any; // Allow additional fields
}

export const validateExcelData = (data: any[]): ValidationError[] => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!Array.isArray(data)) {
    errors.push({
      row: 0,
      message: 'Invalid data format: Expected an array of rows',
      severity: 'error'
    });
    return errors;
  }

  if (data.length === 0) {
    errors.push({
      row: 0,
      message: 'File is empty',
      severity: 'error'
    });
    return errors;
  }

  // Validate header row
  const firstRow = data[0];
  const requiredColumns = ['Name', 'Amount', 'Date', 'Verified'];
  const missingColumns = requiredColumns.filter(col => !(col in firstRow));
  
  if (missingColumns.length > 0) {
    errors.push({
      row: 1,
      message: `Missing required columns: ${missingColumns.join(', ')}`,
      severity: 'error'
    });
    return errors;
  }

  data.forEach((row, index) => {
    const rowNum = index + 1;

    // Validate Name
    if (!row.Name) {
      errors.push({
        row: rowNum,
        column: 'Name',
        message: 'Name is required',
        severity: 'error'
      });
    } else if (typeof row.Name !== 'string') {
      errors.push({
        row: rowNum,
        column: 'Name',
        message: 'Name must be text',
        severity: 'error'
      });
    } else if (row.Name.trim().length === 0) {
      errors.push({
        row: rowNum,
        column: 'Name',
        message: 'Name cannot be empty',
        severity: 'error'
      });
    } else if (row.Name.length > 100) {
      warnings.push({
        row: rowNum,
        column: 'Name',
        message: 'Name is unusually long (>100 characters)',
        severity: 'warning'
      });
    }

    // Validate Amount
    if (row.Amount === undefined || row.Amount === null) {
      errors.push({
        row: rowNum,
        column: 'Amount',
        message: 'Amount is required',
        severity: 'error'
      });
    } else {
      const amount = Number(row.Amount);
      if (isNaN(amount)) {
        errors.push({
          row: rowNum,
          column: 'Amount',
          message: 'Amount must be a number',
          severity: 'error'
        });
      } else if (amount <= 0) {
        errors.push({
          row: rowNum,
          column: 'Amount',
          message: 'Amount must be positive',
          severity: 'error'
        });
      } else if (amount > 1000000) {
        warnings.push({
          row: rowNum,
          column: 'Amount',
          message: 'Amount is unusually large (>1,000,000)',
          severity: 'warning'
        });
      }
    }

    // Validate Date
    if (!row.Date) {
      errors.push({
        row: rowNum,
        column: 'Date',
        message: 'Date is required',
        severity: 'error'
      });
    } else {
      const date = new Date(row.Date);
      if (isNaN(date.getTime())) {
        errors.push({
          row: rowNum,
          column: 'Date',
          message: 'Invalid date format',
          severity: 'error'
        });
      } else {
        const now = new Date();
        if (date > now) {
          warnings.push({
            row: rowNum,
            column: 'Date',
            message: 'Date is in the future',
            severity: 'warning'
          });
        }
      }
    }

    // Validate Verified
    if (row.Verified === undefined || row.Verified === null) {
      errors.push({
        row: rowNum,
        column: 'Verified',
        message: 'Verified status is required',
        severity: 'error'
      });
    } else if (typeof row.Verified === 'string') {
      const value = row.Verified.toLowerCase().trim();
      if (value !== 'yes' && value !== 'no' && value !== 'true' && value !== 'false') {
        errors.push({
          row: rowNum,
          column: 'Verified',
          message: 'Verified must be Yes/No or True/False',
          severity: 'error'
        });
      }
    } else if (typeof row.Verified !== 'boolean') {
      errors.push({
        row: rowNum,
        column: 'Verified',
        message: 'Verified must be a boolean value',
        severity: 'error'
      });
    }
  });

  return [...errors, ...warnings];
};

export const validateSheetStructure = (data: any[]): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data || !Array.isArray(data)) {
    errors.push({
      row: 0,
      message: 'Invalid file format: Expected Excel data',
      severity: 'error'
    });
    return errors;
  }

  if (data.length === 0) {
    errors.push({
      row: 0,
      message: 'Sheet is empty',
      severity: 'error'
    });
    return errors;
  }

  if (data.length > 10000) {
    errors.push({
      row: 0,
      message: 'Sheet contains too many rows (>10,000). Please split the data into smaller files.',
      severity: 'error'
    });
    return errors;
  }

  const firstRow = data[0];
  const requiredColumns = ['Name', 'Amount', 'Date', 'Verified'];
  const missingColumns = requiredColumns.filter(col => !(col in firstRow));

  if (missingColumns.length > 0) {
    errors.push({
      row: 0,
      message: `Missing required columns: ${missingColumns.join(', ')}`,
      severity: 'error'
    });
  }

  const extraColumns = Object.keys(firstRow).filter(col => !requiredColumns.includes(col));
  if (extraColumns.length > 0) {
    errors.push({
      row: 0,
      message: `Warning: Found extra columns that will be ignored: ${extraColumns.join(', ')}`,
      severity: 'warning'
    });
  }

  return errors;
};

export const handleAxiosError = (error: AxiosError<ApiError>, defaultMessage: string = 'An error occurred'): string => {
  if (error.response) {
    const data = error.response.data;
    
    // Handle validation errors
    if (data.errors && data.errors.length > 0) {
      const criticalErrors = data.errors.filter(e => e.severity === 'error');
      if (criticalErrors.length > 0) {
        return criticalErrors[0].message;
      }
    }

    if (data.error) {
      return data.error;
    } else if (data.message) {
      return data.message;
    }

    // Handle specific HTTP status codes
    switch (error.response.status) {
      case 400:
        return 'Invalid data format. Please check your Excel file structure.';
      case 401:
        return 'Unauthorized. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 413:
        return 'The file is too large. Please split it into smaller files.';
      case 422:
        return 'The uploaded file contains invalid data. Please check the file contents.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Server error (${error.response.status}). Please try again later.`;
    }
  } else if (error.request) {
    return 'No response from server. Please check your connection.';
  } else if (error.code === 'ECONNABORTED') {
    return 'Request timed out. The file might be too large.';
  }
  
  return error.message || defaultMessage;
};

export const handleFileValidationError = (file: File): string | null => {
  if (!file) {
    return 'No file selected';
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];

  if (!file.name.match(/\.(xlsx|xls)$/i)) {
    return 'Only Excel files (.xlsx, .xls) are allowed';
  }

  if (!allowedTypes.includes(file.type)) {
    return 'Invalid file type. Only Excel files are allowed';
  }

  if (file.size === 0) {
    return 'The file is empty';
  }

  if (file.size > maxSize) {
    return `File size should not exceed ${maxSize / (1024 * 1024)}MB`;
  }

  return null;
};

export const showErrorToast = (message: string | undefined, options = {}) => {
  toast.error(message || 'An error occurred', {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    ...options
  });
};

export const showSuccessToast = (message: string | undefined, options = {}) => {
  toast.success(message || 'Operation successful', {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    ...options
  });
};

export const formatValidationErrors = (errors: ValidationError[]): { [key: string]: ValidationError[] } => {
  return errors.reduce((acc, error) => {
    const sheetName = error.sheetName || 'Unknown Sheet';
    if (!acc[sheetName]) {
      acc[sheetName] = [];
    }
    acc[sheetName].push({
      ...error,
      message: error.column 
        ? `${error.column}: ${error.message}`
        : error.message
    });
    return acc;
  }, {} as { [key: string]: ValidationError[] });
}; 