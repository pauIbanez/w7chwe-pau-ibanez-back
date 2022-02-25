const notFoundError = (req, res) => {
  res.status(404).json({ error: "Resource not found" });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const code = err.code || 500;

  res.status(code).json({ error: err.message });
};

module.exports = { notFoundError, errorHandler };
