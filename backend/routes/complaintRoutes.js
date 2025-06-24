const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const checkRole = require("../middleware/roleCheck");
const upload = require("../middleware/upload");

const {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  getComplaintStats,
  updateComplaintStatus,    
  getPrioritizedComplaints,
  replyToComplaint,
  getStats, deleteComplaint
  
} = require("../controllers/complaintController");


// USER ROUTES
router.post("/create", auth, upload.single("file"), createComplaint);
router.get("/my", auth, getMyComplaints);
router.get("/priority-queue", auth, getPrioritizedComplaints);

// ADMIN ROUTES
router.get("/all", auth, checkRole("block-admin", "admin","group-admin", "super-admin")
, getAllComplaints);
router.put("/update/:id", auth, checkRole("block-admin", "admin","group-admin", "super-admin")
, updateComplaintStatus);
router.get("/stats", auth, checkRole("block-admin","admin", "group-admin", "super-admin")
, getComplaintStats);


// Reply to complaint (email)
router.post("/:id/reply", auth, checkRole("block-admin", "group-admin", "super-admin")
, replyToComplaint);
router.delete("/:id", auth, deleteComplaint);


module.exports = router;
