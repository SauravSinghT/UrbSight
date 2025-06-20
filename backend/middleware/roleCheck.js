const User = require("../models/User");

const checkRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ msg: "User not found" });

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ msg: "Access denied. Insufficient permissions." });
      }

      next();
    } catch (err) {
      res.status(500).json({ msg: "Server error" });
    }
  };
};

module.exports = checkRole;
