import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { Captain } from "../models/captain.model.js"; // ✅ import Captain

export const verifyCaptainJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Not authorized, token missing");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const captain = await Captain.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!captain) {
      throw new ApiError(401, "Not authorized, captain not found");
    }

    req.captain = captain;
    next();
  } catch (error) {
    throw new ApiError(401, "Not authorized invalid token");
  }
});
