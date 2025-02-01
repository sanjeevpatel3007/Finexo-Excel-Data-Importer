import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface ErrorDisplayProps {
  open: boolean;
  onClose: () => void;
  errors: {
    [sheetName: string]: Array<{
      row: number;
      message: string;
    }>;
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`error-tabpanel-${index}`}
      aria-labelledby={`error-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ open, onClose, errors }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const sheetNames = Object.keys(errors);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <Dialog open={open} onClose={() => onClose()} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Validation Errors</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {sheetNames.length > 1 && (
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            {sheetNames.map((sheetName, index) => (
              <Tab key={index} label={sheetName} />
            ))}
          </Tabs>
        )}

        {sheetNames.map((sheetName, index) => (
          <TabPanel key={index} value={selectedTab} index={index}>
            <List>
              {errors[sheetName].map((error, errorIndex) => (
                <ListItem key={errorIndex}>
                  <ListItemText
                    primary={`Row ${error.row}`}
                    secondary={error.message}
                    primaryTypographyProps={{
                      color: 'error',
                      fontWeight: 'medium'
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </TabPanel>
        ))}
      </DialogContent>
    </Dialog>
  );
};

export default ErrorDisplay; 