import {createRide} from "../controller/ride.controller.js"
import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create-ride", verifyJWT, createRide);


export default router;