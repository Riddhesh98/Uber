import express from "express";
import { calculateRoute , addressSuggestions } from "../controller/map.controller.js";
import { getFare } from "../controller/ride.controller.js";

const router = express.Router();

router.post("/calculate-route", calculateRoute);
router.get("/fare", getFare);
router.get("/address-suggestions", addressSuggestions);

export default router;
