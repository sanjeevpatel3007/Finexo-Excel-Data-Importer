const config = {
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/excel_importer',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
};

module.exports = config; 