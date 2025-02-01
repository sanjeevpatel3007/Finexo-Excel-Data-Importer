const isCurrentMonth = (date) => {
  const now = new Date();
  const inputDate = new Date(date);
  
  // Allow dates within the last 12 months
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(now.getMonth() - 12);
  
  return inputDate >= twelveMonthsAgo && inputDate <= now;
};

module.exports = {
  isCurrentMonth
}; 