import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getAdminJobs, getAllJobs, getJobById, postJob, updateJob, deleteJob, closeJob } from "../controllers/job.controller.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = express.Router();

router.route("/post").post(isAuthenticated, authorizeRoles('employer'), postJob);
router.route("/get").get(getAllJobs);
router.route("/getadminjobs").get(isAuthenticated, authorizeRoles('employer'), getAdminJobs);
router.route("/get/:id").get(getJobById);
router.route("/:id").put(isAuthenticated, authorizeRoles('employer'), updateJob).delete(isAuthenticated, authorizeRoles('employer'), deleteJob);
router.route("/:id/close").patch(isAuthenticated, authorizeRoles('employer'), closeJob);

export default router;

