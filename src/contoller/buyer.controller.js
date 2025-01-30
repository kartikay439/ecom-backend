import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import {Buyer} from "../models/buyer.model.js";
import {uploadOnCLoudinary} from "../utils/cloudinary.service.js";
import ApiResponse from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

// Generate access and refresh tokens
const generateAccessAndRefreshTokens = async (UserId) => {
    try {
        const user = await Buyer.findById(UserId);
        const accessToken =await user.generateAccessToken();
        const refreshToken =await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return {accessToken, refreshToken};
    } catch (error) {
        console.log(error);
        throw new ApiError(500,error.message);

    }
};
const signUpWithNumber = async (req, res) => {
    try {
        const { mobile } = req.body;
        if (!mobile) {
            throw new ApiError(400, "Mobile number is required");
        }

        console.log(mobile);

        // Check if the buyer already exists
        const buyer = await Buyer.findOne({ mobile });
        if (buyer) {
            throw new ApiError(400, "Buyer already registered");
        }

        // Create new buyer
        const buyerOnDb = await Buyer.create({ mobile });
        if (!buyerOnDb) {
            throw new ApiError(500, "Buyer not registered due to an internal error");
        }

        // Generate tokens for the new buyer
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(buyerOnDb._id);

        // Set cookie options
        const options = {
            httpOnly: true,
            secure: true, // Use `secure: true` only in production
        };

        // Send response with tokens in cookies
        res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, "User signed up with mobile number successfully"));
    } catch (error) {
        // Handle errors gracefully
        const statusCode = error.statusCode || 500; // Use error-specific statusCode if available
        const errorMessage = error.message || "An unexpected error occurred";
        res.status(statusCode).json({ error: errorMessage });
    }
};



// Register user
const registerUser = asyncHandler(async (req, res) => {
    const {name, email, password, gender, address} = req.body;
    //profilePhoto will come through multer

    //

    if ([email, name, password].some((f) => f?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{userName}, {email}],
    });

    if (existedUser) {
        throw new ApiError(409, "User with duplicate username or email!");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCLoudinary(avatarLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar is required");
    }

    const user = await User.create({
        avatar: avatar.url,
        email,
        password,
        userName: userName.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"));
});

// Login user
const loginUser = asyncHandler(async (req, res) => {
    const {email, username, password} = req.body;

    if (!username && !email) {
        throw new ApiError(400, "Username or Password is required");
    }

    const user = await User.findOne({
        $or: [{email}, {username}]
    })

    if (!user) {
        throw new ApiError(400, "User not registered");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid user credentials");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

    const loggedUser = await User.findById(user._id).select("-password -refreshToken");


    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, {user: loggedUser, accessToken, refreshToken}, "User logged in successfully"));
});

// Log out user
const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {refreshToken: 1},
        },
        {new: true}
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "User logged out"));
});

// Refresh access token
const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (!incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized Access");
        }

        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id);
        if (!user) {
            throw new ApiError(400, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

        const options = {
            httpOnly: true,
            secure: true,
        };

        return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(new ApiResponse(200, {
            user,
            accessToken,
            refreshToken
        }, "Access token refreshed"));
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

// Change current user password
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const {oldPassword, newPassword} = req.body;

    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(404, "Old password not matched");
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false});

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

// Get current user details
const getCurrentUser = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) {
        throw new ApiError(401, "Please sign in first");
    }
    return res.status(200).json(new ApiResponse(200, user, "You are logged in"));
});

// Update account details
const updateAccountDetails = asyncHandler(async (req, res) => {
    const {fullname, email} = req.body;

    if (!fullname || !email) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {fullname, email},
        },
        {new: true}
    ).select("-password");

    return res.status(200).json(new ApiResponse(200, user, "Account details updated successfully"));
});

// Update avatar
const avatarUpdate = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) {
        throw new ApiError(400, "You are required to login first");
    }

    let avatarLocalPath = req.files?.avatar[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    const avatar = await uploadOnCLoudinary(avatarLocalPath);

    if (!avatar?.url) {
        throw new ApiError(400, "Unable to upload on cloud");
    }

    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {avatar: avatar.url},
        },
        {
            new: true,
        }
    ).select("-password");

    return res.status(200).json(new ApiResponse(200, {}, "Avatar updated successfully"));
})

export {
    signUpWithNumber,
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    avatarUpdate,
};
