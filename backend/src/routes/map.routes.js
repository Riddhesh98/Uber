import express from "express";
import { calculateRoute } from "../controller/map.controller.js";

const router = express.Router();

router.post("/calculate-route", calculateRoute);

export default router;
