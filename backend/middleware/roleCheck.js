const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // req.user is already populated with full info in auth.js
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ msg: "Access denied. Insufficient permissions." });
      }

      next();
    } catch (err) {
      console.error("Role check error:", err.message);
      res.status(500).json({ msg: "Server error" });
    }
  };
};

module.exports = checkRole;
