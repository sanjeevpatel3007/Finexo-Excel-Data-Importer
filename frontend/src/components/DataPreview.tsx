import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Pagination,
  useTheme,
  Tooltip,
  Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface DataPreviewProps {
  sheets: { [key: string]: any[] };
  onDeleteRow: (sheetName: string, rowIndex: number) => void;
}

const ROWS_PER_PAGE = 10;

const formatDate = (value: any) => {
  if (!value) return '-';
  try {
    // If it's already in ISO format (YYYY-MM-DD)
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = value.split('-');
      return `${day}/${month}/${year}`;
    }

    // Handle Excel date (number of days since 1900-01-01)
    if (typeof value === 'number') {
      const excelEpoch = new Date(1899, 11, 30);
      const dateValue = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
      if (isNaN(dateValue.getTime())) {
        return '-';
      }
      return dateValue.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }

    // Handle other string formats
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return '-';
    }
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return '-';
  }
};

const formatNumber = (value: any) => {
  if (typeof value !== 'number') return value;
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(value);
};

const formatValue = (value: any, header: string) => {
  if (value === null || value === undefined) return '-';
  
  // Check if the header suggests this is a date field
  const isDateField = /date|dt|time/i.test(header);
  
  if (isDateField) {
    return formatDate(value);
  }
  
  // Check if it's a boolean value
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  // Format numbers
  if (typeof value === 'number') {
    return formatNumber(value);
  }
  
  return value.toString();
};

const DataPreview: React.FC<DataPreviewProps> = ({ sheets, onDeleteRow }) => {
  const theme = useTheme();
  const [selectedSheet, setSelectedSheet] = useState<string>(Object.keys(sheets)[0] || '');
  const [page, setPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, sheetName: '', rowIndex: -1 });

  const handleSheetChange = (event: any) => {
    setSelectedSheet(event.target.value);
    setPage(1);
  };

  const handleDeleteClick = (sheetName: string, rowIndex: number) => {
    setDeleteDialog({ open: true, sheetName, rowIndex });
  };

  const handleDeleteConfirm = () => {
    onDeleteRow(deleteDialog.sheetName, deleteDialog.rowIndex);
    setDeleteDialog({ open: false, sheetName: '', rowIndex: -1 });
  };

  const currentData = sheets[selectedSheet] || [];
  const totalPages = Math.ceil(currentData.length / ROWS_PER_PAGE);
  const startIndex = (page - 1) * ROWS_PER_PAGE;
  const displayData = currentData.slice(startIndex, startIndex + ROWS_PER_PAGE);

  return (
    <Box sx={{ width: '100%', mt: 3 }}>
      <FormControl 
        fullWidth 
        sx={{ 
          mb: 3,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            '&:hover fieldset': {
              borderColor: 'primary.main',
            },
          }
        }}
      >
        <InputLabel>Select Sheet</InputLabel>
        <Select value={selectedSheet} onChange={handleSheetChange} label="Select Sheet">
          {Object.keys(sheets).map((sheetName) => (
            <MenuItem key={sheetName} value={sheetName}>
              <Typography 
                component="span" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1 
                }}
              >
                {sheetName}
                <Chip 
                  label={`${sheets[sheetName].length} rows`} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              </Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedSheet && (
        <TableContainer 
          component={Paper} 
          sx={{ 
            borderRadius: 2,
            boxShadow: theme.shadows[2],
            '& .MuiTableCell-head': {
              bgcolor: 'primary.main',
              color: 'white',
              fontWeight: 'bold'
            }
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                {Object.keys(currentData[0] || {}).map((header) => (
                  <TableCell key={header}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {header}
                      <Tooltip title="Click to sort" arrow>
                        <InfoOutlinedIcon sx={{ fontSize: 16 }} />
                      </Tooltip>
                    </Box>
                  </TableCell>
                ))}
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayData.map((row, index) => (
                <TableRow 
                  key={index}
                  sx={{
                    '&:nth-of-type(odd)': {
                      bgcolor: 'action.hover',
                    },
                    '&:hover': {
                      bgcolor: 'action.selected',
                    },
                  }}
                >
                  {Object.entries(row).map(([header, cell], cellIndex) => (
                    <TableCell key={cellIndex}>
                      {formatValue(cell, header)}
                    </TableCell>
                  ))}
                  <TableCell align="center">
                    <Tooltip title="Delete row" arrow>
                      <IconButton
                        onClick={() => handleDeleteClick(selectedSheet, startIndex + index)}
                        color="error"
                        size="small"
                        sx={{
                          '&:hover': {
                            bgcolor: 'error.light',
                            '& .MuiSvgIcon-root': {
                              color: 'white',
                            },
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: 2,
              },
            }}
          />
        </Box>
      )}

      <Dialog 
        open={deleteDialog.open} 
        onClose={() => setDeleteDialog({ open: false, sheetName: '', rowIndex: -1 })}
        PaperProps={{
          sx: {
            borderRadius: 2,
            width: '100%',
            maxWidth: 400,
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: 'error.light', color: 'white' }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography>Are you sure you want to delete this row?</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setDeleteDialog({ open: false, sheetName: '', rowIndex: -1 })}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 'medium'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error"
            variant="contained"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 'medium'
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DataPreview; 