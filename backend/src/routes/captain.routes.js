import { Router } from "express";
import { verifyCaptainJWT } from "../middleware/authCaptain.middleware.js";
import {
    registerCaptain,
    loginCaptain,
    getCaptainProfile,
    logoutCaptain
} from "../controller/captain.controller.js";

const router = Router();

router.route("/register-captain").post(registerCaptain);
router.route("/login-Captain").post(loginCaptain);
router.route("/profile-Captain").get(verifyCaptainJWT, getCaptainProfile);
router.route("/logout-Captain").post(verifyCaptainJWT, logoutCaptain);

export default router;