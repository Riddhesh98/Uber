import {createRide , confrimRide,startRide} from "../controller/ride.controller.js"
import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {verifyCaptainJWT} from "../middleware/authCaptain.middleware.js"

const router = express.Router();

router.post("/create-ride", verifyJWT, createRide);
router.post("/confirm-ride",verifyCaptainJWT, confrimRide);
router.post("/start-ride",verifyCaptainJWT, startRide);

export default router;