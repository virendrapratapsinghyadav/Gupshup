import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ENV } from "../utils/Env.js";
import cloudinary from "../utils/cloudinary.js";

//Generate tokens for authentication
const generateWebTokens = (payload) => {
  const refreshToken = jwt.sign(payload, ENV.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  const accessToken = jwt.sign(payload, ENV.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  return { refreshToken, accessToken };
};

//Generate Cookies
const setTokenCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: ENV.NODE_ENV === "development" ? false : true,
    sameSite: ENV.NODE_ENV === "development" ? "lax" : "Strict",
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, //Prevents XSS attacks: cross-site scripting
    secure: ENV.NODE_ENV === "development" ? false : true,
    sameSite: ENV.NODE_ENV === "development" ? "lax" : "Strict", //Prevent CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const signUp = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    const normalisedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalisedEmail });
    if (existingUser) {
      return res.status(409).json(new ApiError(409, "User already exists"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      fullName,
      email: normalisedEmail,
      password: hashedPassword,
    });

    //send Tokens
    const tokens = generateWebTokens({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
    });

    user.refreshToken = tokens.refreshToken;
    await user.save();

    setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          profilePic: user.profilePic || null,
        },
        "User SignedUp successfully"
      )
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json(new ApiError(500, "Failed to signUp"));
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const normalisedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalisedEmail });
    if (!user) {
      return res.status(404).json(new ApiError(404, "User doesn't exits"));
    }

    const isPassword = await bcrypt.compare(password, user.password);
    if (!isPassword) {
      return res.status(409).json(new ApiError(409, "Wrong password"));
    }

    //send Tokens
    const tokens = generateWebTokens({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
    });

    user.refreshToken = tokens.refreshToken;
    await user.save();

    setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          profilePic: user.profilePic || null,
        },
        "User login successfully"
      )
    );
  } catch (error) {
    console.log("Login Error hai bhai", error);
    return res.status(500).json(new ApiError(500, "Login failed"));
  }
};

const logOut = async (req, res) => {
  try {
    //Get refresh token
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json(new ApiError(401, "Unauthorized"));
    }

    //Verify token
    const decoded = jwt.verify(refreshToken, ENV.REFRESH_TOKEN_SECRET);
    const userId = decoded.id;

    //Check for the userId in DB
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(new ApiError(404, "User not found"));
    }

    user.refreshToken = null;
    await user.save();

    const options = {
      httpOnly: true,
      secure: ENV.NODE_ENV === "development" ? false : true,
      sameSite: ENV.NODE_ENV === "development" ? "lax" : "Strict",
    };

    //Clearing cookies
    res.clearCookie("accessToken", options);
    res.clearCookie("refreshToken", options);

    return res
      .status(200)
      .json(new ApiResponse(200, null, "LogOut successfull"));
  } catch (error) {
    console.log("Logout error: ", error);
    return res.status(500).json(new ApiError(500, "Logout failed"));
  }
};

const updateProfile = async (req, res) => {
  try {
    //Getting the Image from client
    const { profilePic } = req.body; //Since not using Multer so, its expecting URL or BASE64 string
    if (!profilePic) {
      return res
        .status(400)
        .json(new ApiError(400, "No profile picture provided"));
    }

    //we will get userId later from protected middleware
    const userId = req.user._id;

    //Uploading Image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(profilePic, {
      folder: "profile_pics",
      width: 500,
      height: 500,
      crop: "fill",
    });

    //Check for the user and save the image to the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true } // tells Mongoose to return the updated document after applying the changes
    );
    if (!updatedUser) {
      return res.status(404).json(new ApiError(404, "User not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, updatedUser, "Profile Updated Successfully"));
  } catch (error) {
    console.log("Failed profilePic update", error);
    return res.status(500).json(new ApiError(500, "profilePic Update failed"));
  }
};

export {
  signUp,
  login,
  logOut,
  updateProfile,
  generateWebTokens,
  setTokenCookies,
};
