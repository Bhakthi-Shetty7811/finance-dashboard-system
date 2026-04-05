const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path} —`, err.message);

  if (err.code === '23505') return res.status(409).json({ success:false, message:'Already exists' });
  if (err.code === '23503') return res.status(400).json({ success:false, message:'Referenced resource not found' });
  if (err.code === '23514') return res.status(400).json({ success:false, message:'Invalid value' });

  const status  = err.statusCode || err.status || 500;
  const message = status < 500 ? err.message : 'Internal server error';
  return res.status(status).json({ success: false, message });
};

const notFoundHandler = (req, res) =>
  res.status(404).json({ success: false, message: `${req.method} ${req.path} not found` });

module.exports = { errorHandler, notFoundHandler };