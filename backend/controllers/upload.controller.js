const excelService = require('../services/excel.service');
const Data = require('../models/data.model');

class UploadController {
  async validateFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const results = await excelService.processFile(req.file.buffer);
      
      // Check if there are any validation errors
      const hasErrors = results.some(result => result.errors.length > 0);
      
      if (hasErrors) {
        return res.status(400).json({
          success: false,
          errors: results.flatMap(result => result.errors)
        });
      }

      // Store validated data in session for later import
      req.session.validatedData = results.flatMap(result => result.data);
      
      return res.status(200).json({
        success: true,
        message: 'File validated successfully',
        rowCount: req.session.validatedData.length
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async importData(req, res) {
    try {
      const validatedData = req.session.validatedData;
      
      if (!validatedData || !validatedData.length) {
        return res.status(400).json({
          success: false,
          error: 'No validated data found. Please upload and validate a file first.'
        });
      }

      // Use bulk insert for better performance
      const result = await Data.insertMany(validatedData, { ordered: false });
      
      // Clear the session data
      req.session.validatedData = null;

      return res.status(200).json({
        success: true,
        message: 'Data imported successfully',
        importedCount: result.length
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new UploadController(); 