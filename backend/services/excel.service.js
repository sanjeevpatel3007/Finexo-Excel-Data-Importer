const XLSX = require('xlsx');
const { sheetConfigs } = require('../config/excel.config');
const { isCurrentMonth } = require('../utils/validators');

class ExcelService {
  constructor() {
    this.errors = [];
  }

  async processFile(buffer) {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const results = [];
      
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);
        
        const validatedData = await this.validateSheetData(data, sheetName);
        results.push({
          sheetName,
          data: validatedData.valid,
          errors: validatedData.errors
        });
      }
      
      return results;
    } catch (error) {
      throw new Error(`Error processing Excel file: ${error.message}`);
    }
  }

  async validateSheetData(data, sheetName) {
    const config = sheetConfigs.default; // Using default config for now
    const valid = [];
    const errors = [];

    data.forEach((row, index) => {
      const rowNumber = index + 2; // Adding 2 because Excel rows start at 1 and we skip header
      const validatedRow = this.validateRow(row, config, rowNumber, sheetName);
      
      if (validatedRow.isValid) {
        valid.push(validatedRow.data);
      } else {
        errors.push(...validatedRow.errors);
      }
    });

    return { valid, errors };
  }

  validateRow(row, config, rowNumber, sheetName) {
    const errors = [];
    const transformedData = {};
    let isValid = true;

    for (const [excelColumn, dbField] of Object.entries(config.columnMapping)) {
      const value = row[excelColumn];
      const validation = config.validations[dbField];

      if (validation.required && !value) {
        errors.push({
          sheet: sheetName,
          row: rowNumber,
          message: `${excelColumn} is required`
        });
        isValid = false;
        continue;
      }

      try {
        transformedData[dbField] = this.validateField(value, validation, excelColumn);
      } catch (error) {
        errors.push({
          sheet: sheetName,
          row: rowNumber,
          message: error.message
        });
        isValid = false;
      }
    }

    return {
      isValid,
      data: isValid ? { ...transformedData, sheetName } : null,
      errors
    };
  }

  validateField(value, validation, fieldName) {
    if (!value && !validation.required) {
      return null;
    }

    switch (validation.type) {
      case 'number':
        const num = Number(value);
        if (isNaN(num)) {
          throw new Error(`${fieldName} must be a number`);
        }
        if (validation.min !== undefined && num < validation.min) {
          throw new Error(`${fieldName} must be greater than ${validation.min}`);
        }
        return num;

      case 'date':
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          throw new Error(`${fieldName} must be a valid date`);
        }
        if (validation.validator === 'isCurrentMonth' && !isCurrentMonth(date)) {
          throw new Error(`${fieldName} must be in the current month`);
        }
        return date;

      case 'boolean':
        return validation.transform ? validation.transform(value) : Boolean(value);

      default:
        return String(value);
    }
  }
}

module.exports = new ExcelService(); 