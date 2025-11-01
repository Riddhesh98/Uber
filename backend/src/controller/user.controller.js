import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"


const generateAcessAndRefreshToken = async (userId) => {
    try {
            const user = await User.findById(userId)
            const accessToken = user.generateAccessToken();
            const refreshToken = user.generateRefreshToken();
            user.refreshToken = refreshToken;
            await user.save({validateBeforeSave: false});

            return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Could not generate tokens, try again later");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // Logic for registering a user

    const {firstname, lastname, email, password} = req.body;

    if([firstname, email, password].some((field) => field?.trim() == "")){
        throw new ApiError(400, "Firstname, email and password are required");
    }

    //check for existing user

    const existingUser = await User.findOne(
       { 
        $or:[{ email } , {firstname}]
        }
    )

    if(existingUser){
        throw new ApiError(409, "User with given email or firstname already exists");
    }
  

    const user = await User.create({
        firstname,
        lastname,
        email,
        password
    });

    if(!user){
        throw new ApiError(500, "Could not create user, try again later");
    }


    const {accessToken , refreshToken} = await generateAcessAndRefreshToken(user._id);

    const createdUser = await User.findById(user._id).select("-password -refreshToken ");

    if(!createdUser){
        throw new ApiError(500, "Could not fetch created user, try again later");
    }

    const options = {
        httpOnly: true,
        secure : true,
    }

    return res
    .status(201)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
        new ApiResponse(
            201,
          {user: createdUser, accessToken},
            "User registered successfully"
        )
    );
})



const loginUser = asyncHandler(async (req, res) => {
    // Logic for logging in a user
    const { email, password } = req.body;

    if ([email, password].some((field) => field?.trim() == "")) {
        throw new ApiError(400, "Email and password are required");
    }


   const user= await User.findOne({ email });
    if(!user){
     throw new ApiError(404, "User with given email does not exist");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if(!isPasswordCorrect){
        throw new ApiError(401, "Incorrect password");
    }

    const {accessToken , refreshToken} = await generateAcessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken ");

    const options = {
        httpOnly: true,
        secure : true,
    }

    return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
        new ApiResponse(
            200,
          {user: loggedInUser,refreshToken, accessToken},
            "User logged in successfully"
        )
    );

})

const getUserProfile = asyncHandler(async (req, res) => {
    // Logic for getting user profile
    const userId = req.user?._id;

    if(!userId){
        throw new ApiError(400, "User ID is not getting from token");
    }

    const user = await User.findById(userId).select("-password -refreshToken");

    if(!user){
        throw new ApiError(404, "User not found");
    }
  

    res.status(200).json(
        new ApiResponse(
            200,
            {user: user},
            "User profile fetched successfully"
        )
    );

})

const logoutUser = asyncHandler(async (req, res) => {
    // Logic for logging out a user

    const userId = req.user?._id;

    if(!userId){
        throw new ApiError(400, "User ID is not getting from token");
    }

    const user =  User.findByIdAndUpdate(
       userId,
        {
           $unset:{
            refreshToken : 1 
           }

        },
        {
            new : true,
        }
    );

    const options = {
        httpOnly: true,
        secure : true,
    }

    return res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(
        new ApiResponse(
            200,
          {},
            "User logged out successfully"
        )
    );
});





export {registerUser, loginUser , getUserProfile,logoutUser};
