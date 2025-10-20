// Not-found and error handlers
export function notFound(req, res, next) {
  // Pass a 404 error to the error handler
  next({ statusCode: 404, message: `Route ${req.originalUrl} not found` });
}

export function errorHandler(err, req, res, next) {
  const status = err.statusCode || err.status || 500;
  const message = err.message || "Internal Server Error";
  const details = err.details;

  // Avoid leaking internals in production
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) {
    // Helpful debug in dev
    // eslint-disable-next-line no-console
    console.error("❌ Error:", err);
  }

  return res.status(status).json({
    success: false,
    message,
    ...(details && { details }),
  });
}
