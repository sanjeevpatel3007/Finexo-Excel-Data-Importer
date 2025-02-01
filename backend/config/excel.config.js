const sheetConfigs = {
  default: {
    columnMapping: {
      'Name': 'name',
      'Amount': 'amount',
      'Date': 'date',
      'Verified': 'verified'
    },
    validations: {
      name: {
        required: true,
        type: 'string'
      },
      amount: {
        required: true,
        type: 'number',
        min: 0
      },
      date: {
        required: true,
        type: 'date',
        validator: 'isCurrentMonth'
      },
      verified: {
        required: false,
        type: 'boolean',
        transform: (value) => value.toLowerCase() === 'yes'
      }
    }
  }
};

module.exports = {
  maxFileSize: 2 * 1024 * 1024, // 2MB in bytes
  allowedExtensions: ['.xlsx'],
  sheetConfigs
}; 