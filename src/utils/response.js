const success = (res, data = null, message = 'Success', statusCode = 200, meta = null) => {
  const body = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
};

const created  = (res, data, message = 'Created')    => success(res, data, message, 201);
const error    = (res, message = 'Server error', statusCode = 500) =>
  res.status(statusCode).json({ success: false, message });

const badRequest   = (res, message, errors = null) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(400).json(body);
};
const unauthorized = (res, message = 'Authentication required')          => error(res, message, 401);
const forbidden    = (res, message = 'You do not have permission')       => error(res, message, 403);
const notFound     = (res, message = 'Not found')                        => error(res, message, 404);
const conflict     = (res, message = 'Resource already exists')          => error(res, message, 409);

module.exports = { success, created, error, badRequest, unauthorized, forbidden, notFound, conflict };