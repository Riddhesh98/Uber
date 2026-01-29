import { Captain } from "../models/Captain.model.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"


const generateAcessAndRefreshToken = async (captainId) => {
    try {
        const captain = await Captain.findById(captainId);
        if (!captain) {
            throw new ApiError(404, "Captain not found while generating tokens");
        }

        const accessToken = captain.generateAccessToken();
        const refreshToken = captain.generateRefreshToken();

        captain.refreshToken = refreshToken;
        await captain.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Could not generate tokens, try again later");
    }
};




// 🚢 Register Captain

const registerCaptain = asyncHandler(async (req, res) => {
    //logic for registering a captain
    const { firstName, lastName, email, password, vehicle} = req.body;

    if([firstName, lastName, email, password].some((field) => field.trim() == "")) {
        throw new ApiError(400, "All fields are required");
    }

    //check if captain already exists
    const alreadyExist = await Captain.findOne({ email });

    if (alreadyExist) {
        throw new ApiError(409, "Captain with this email already exists");
    }

    const captain = await Captain.create({
        firstName,
        lastName,
        email,
        password,
        vehicle: {
            color: vehicle.color,
            plate: vehicle.plate,
            capacity: vehicle.capacity,
            vehicleType: vehicle.vehicleType
          }
    })

    
    if(!captain) {
        throw new ApiError(500, "Could not create captain, try again later");
    }

    const {accessToken, refreshToken} = await generateAcessAndRefreshToken(captain._id);

    const options = {
        httpOnly: true,
        secure : true,
    }

    res
    .status(201)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
        new ApiResponse(
            201,
            "Captain registered successfully",
            {
                captain: {
                    _id: captain._id,
                    firstName: captain.firstName,
                    lastName: captain.lastName,
                    email: captain.email,
                    color: vehicle.color,
                    plate: vehicle.plate,
                    capacity: vehicle.capacity,
                    vehicleType: vehicle.vehicleType
                    
                },
                accessToken,
                refreshToken
            }
        )
    );

    
})

// 🚢 Login Captain

const loginCaptain = asyncHandler(async (req, res) => {
    //logic for logging in a captain
    const { email, password } = req.body;

    if([email, password].some((field) => field.trim() == "")) {
        throw new ApiError(400, "Email and password are required");
    }

    const captain = await Captain.findOne({ email });

    if(!captain) {
        throw new ApiError(404, "Captain not found");
    }

    const isPasswordCorrect = await captain.isPasswordCorrect(password);

    if(!isPasswordCorrect) {
        throw new ApiError(401, "Invalid password");
    }

    const {accessToken, refreshToken} = await generateAcessAndRefreshToken(captain._id);

    const options = {
        httpOnly: true,
        secure : true,
    }

    res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
        new ApiResponse(
            200,
            "Captain logged in successfully",
            {
                captain: {
                    _id: captain._id,
                    firstName: captain.firstName,
                    lastName: captain.lastName,
                    email: captain.email,
                    phone: captain.phone,
                },
                accessToken,
                refreshToken
            }
        )
    );
})

const getCaptainProfile = asyncHandler(async (req, res) => {
    // Logic for getting captain profile
   
    const captainId = req.captain?._id;
    if(!captainId){
        throw new ApiError(400, "Captain ID is not getting from token");
    }

    const captain = await Captain.findById(captainId).select("-password -refreshToken");

    if(!captain){
        throw new ApiError(404, "Captain not found");
    }

    res.status(200).json(
        new ApiResponse(
            200,
            {captain: captain},
            "Captain profile fetched successfully"
        )
    );


})


const logoutCaptain = asyncHandler(async (req, res) => {
    // Logic for logging out a captain

    const captainId = req.captain?._id;

    if(!captainId){
        throw new ApiError(400, "Captain ID is not getting from token");
    }

    const captain =  Captain.findByIdAndUpdate(
        captainId,
        {refreshToken: null},
        {new: true}
    );

    if(!captain){
        throw new ApiError(404, "Captain not found");
    }

    const options = {
        httpOnly: true,
        secure : true,
        expires: new Date(0),
    }

    return res
    .status(200)
    .cookie("refreshToken", "", options)
    .cookie("accessToken", "", options)
    .json(
        new ApiResponse(
            200,
            null,
            "Captain logged out successfully"
        )
    );

})



export { registerCaptain, loginCaptain , getCaptainProfile, logoutCaptain };
