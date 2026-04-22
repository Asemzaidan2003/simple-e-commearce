/**
 * Extracts and normalizes pagination params from query string
 * @param {object} query - req.query
 * @param {number} defaultLimit - Default items per page
 * @param {number} maxLimit - Maximum allowed items per page
 * @returns {{ page, limit, skip }}
 */
export const getPagination = (query, defaultLimit = 20, maxLimit = 100) => {
  let page  = parseInt(query.page)  || 1;
  let limit = parseInt(query.limit) || defaultLimit;

  if (page < 1)  page  = 1;
  if (limit < 1) limit = 1;
  if (limit > maxLimit) limit = maxLimit;

  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Builds a sort object from query string
 * @param {object} query - req.query  (e.g. ?sort_by=createdAt&sort_order=desc)
 * @param {string} defaultField - Default sort field
 * @returns {object} Mongoose sort object
 */
export const getSort = (query, defaultField = "createdAt") => {
  const field = query.sort_by    || defaultField;
  const order = query.sort_order === "asc" ? 1 : -1;
  return { [field]: order };
};

/**
 * Builds the meta object to include in paginated responses
 */
export const buildPaginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  pages: Math.ceil(total / limit),
  hasNextPage: page < Math.ceil(total / limit),
  hasPrevPage: page > 1,
});
