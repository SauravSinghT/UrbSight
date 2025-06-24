const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth");

const { register, login, getCurrentUser } = require("../controllers/authController");


router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getCurrentUser);

module.exports = router;
