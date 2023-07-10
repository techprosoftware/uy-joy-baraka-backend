const compression = require("compression");

module.exports = compression({
  level: 6,
  threshold: 0,
  filter: (req, res) => {
    if (req.headers["x-no-compression"]) {
      return false;
    }
    return compression.filter(req, res);
  },
});
