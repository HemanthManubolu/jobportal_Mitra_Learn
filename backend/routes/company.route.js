import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getCompany, getCompanyById, registerCompany, updateCompany } from "../controllers/company.controller.js";
import { singleUpload } from "../middlewares/mutler.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = express.Router();

router.route("/register").post(isAuthenticated,authorizeRoles('employer'),registerCompany);
router.route("/get").get(isAuthenticated,authorizeRoles('employer'),getCompany);
router.route("/get/:id").get(isAuthenticated,authorizeRoles('employer'),getCompanyById);
router.route("/update/:id").put(isAuthenticated,authorizeRoles('employer'),singleUpload, updateCompany);

export default router;

