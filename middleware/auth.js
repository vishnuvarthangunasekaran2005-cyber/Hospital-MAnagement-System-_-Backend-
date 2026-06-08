const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "No token provided. Please login." });

  const token = authHeader.split(" ")[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    const msg =
      err.name === "TokenExpiredError"
        ? "Session expired. Please login again."
        : "Invalid token.";
    res.status(401).json({ message: msg });
  }
};

const adminOnly = (req, res, next) => {
  protect(req, res, () => {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied. Admins only." });
    next();
  });
};

module.exports = { protect, adminOnly };
