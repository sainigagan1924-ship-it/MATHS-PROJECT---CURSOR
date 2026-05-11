/**
 * Centralized API error handler.
 */
export function errorHandler(err, req, res, next) {
  let status = err.status || err.statusCode;
  if (!status && err.message && /^(Invalid|Need|Provide|Each|Counts|Unknown)/i.test(err.message)) {
    status = 400;
  }
  if (!status) status = 500;
  const message = err.message || 'Internal server error';
  if (process.env.NODE_ENV !== 'production') {
    console.error('[error]', err);
  }
  res.status(status).json({
    ok: false,
    error: message,
    details: err.details,
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ ok: false, error: 'Route not found' });
}
