import { Router } from "express";
import {
registerUser,
loginUser,
getUserProfile,
logoutUser

} from "../controller/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register-user").post(registerUser);
router.route("/login").post(loginUser);
router.route("/profile").get(verifyJWT,getUserProfile);
router.route("/logout").post(verifyJWT,logoutUser);

export default router;