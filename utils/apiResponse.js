/**
 * Sends a successful response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {any} data - Response payload
 * @param {object} meta - Optional metadata (pagination, etc.)
 */
export const sendSuccess = (res, statusCode = 200, message = "Success", data = null, meta = null) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  if (meta !== null) response.meta = meta;
  return res.status(statusCode).json(response);
};

/**
 * Sends an error response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {any} error - Optional error detail (only shown in development)
 */
export const sendError = (res, statusCode = 500, message = "Something went wrong", error = null) => {
  const response = { success: false, message };
  if (error !== null && process.env.NODE_ENV === "development") {
    response.error = error;
  }
  return res.status(statusCode).json(response);
};

/**
 * Sends a paginated response
 * @param {object} res - Express response object
 * @param {array} data - Array of results
 * @param {number} total - Total documents count
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {string} message - Optional message
 */
export const sendPaginated = (res, data, total, page, limit, message = "Success") => {
  return res.status(200).json({
    success: true,
    message,
    data,
    meta: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
      hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
      hasPrevPage: parseInt(page) > 1,
    },
  });
};
