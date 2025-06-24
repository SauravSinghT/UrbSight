const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);

    // ✅ Fetch full user from DB
    const user = await User.findById(decoded.user.id).select("-password");
    if (!user) return res.status(401).json({ msg: "User not found" });

    // ✅ Attach full user info to req.user
    req.user = {
      id: user._id,
      role: user.role,
      email: user.email,
      name: user.name,
      state: user.state,
      district: user.district,
      block: user.block,
      region: user.region,
      department: user.department
    };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    res.status(401).json({ msg: "Token is not valid" });
  }
};

module.exports = auth;
