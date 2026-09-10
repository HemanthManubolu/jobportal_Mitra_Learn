import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { applyJob, getApplicants, getAppliedJobs, updateStatus } from "../controllers/application.controller.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
 
const router = express.Router();

router.route("/apply/:id").post(isAuthenticated, authorizeRoles('candidate'), applyJob);
router.route("/get").get(isAuthenticated, authorizeRoles('candidate'), getAppliedJobs);
router.route("/:id/applicants").get(isAuthenticated, authorizeRoles('employer','admin'), getApplicants);
router.route("/status/:id/update").post(isAuthenticated, authorizeRoles('employer','admin'), updateStatus);
 

export default router;

