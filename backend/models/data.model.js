const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  sheetName: {
    type: String,
    required: true
  },
  importedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for better query performance
dataSchema.index({ date: 1, name: 1 });

module.exports = mongoose.model('Data', dataSchema); 