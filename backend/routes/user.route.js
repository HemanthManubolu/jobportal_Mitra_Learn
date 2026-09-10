import express from "express";
import { login, logout, register, updateProfile, getMe } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/mutler.js";
import { rateLimit } from "../middlewares/rateLimit.js";
 
const router = express.Router();

router.route("/register").post(rateLimit({max:10}),singleUpload,register);
router.route("/login").post(rateLimit({max:10}),login);
router.route("/logout").get(logout);
router.route("/profile/update").post(isAuthenticated,singleUpload,updateProfile);
router.route("/me").get(isAuthenticated,getMe);

export default router;

