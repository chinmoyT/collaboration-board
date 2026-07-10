// Express 4 doesn't forward rejected promises from async handlers to error
// middleware on its own — an unhandled rejection here would crash the
// process the same way the unguarded socket handler did. This wraps a
// handler so any thrown/rejected error reaches next(err) instead.
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { asyncHandler };
