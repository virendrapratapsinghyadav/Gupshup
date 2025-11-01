import { sendWelcomeEmail } from "../emails/emailHandler.js";
import { User } from "../models/User.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import {ENV} from '../utils/env.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Generate Tokens
const generateTokens = (payload) => {
  const refreshToken = jwt.sign(payload, ENV.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  const accessToken = jwt.sign(payload, ENV.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  return { accessToken, refreshToken };
};

// Generate cookies
const setTokenCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: ENV.NODE_ENV === "development" ? false : true,
    sameSite: "Strict",
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, //Prevents XSS attacks: cross-site scripting
    secure: ENV.NODE_ENV === "development" ? false : true,
    sameSite: "Strict", //Prevent CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// Sign Up
const signUp = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return next(
        new apiError(400, "fullName, email and password are required")
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return next(new apiError(409, "User already exists"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email: normalizedEmail,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    // Generate tokens
    const tokens = generateTokens({
      email: savedUser.email,
      fullName: savedUser.fullName,
    });

    // Save refresh token in DB
    savedUser.refreshToken = tokens.refreshToken;
    await savedUser.save();

    // Set cookies
    setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

    try {
      await sendWelcomeEmail(
        savedUser.email,
        savedUser.fullName,
        ENV.CLIENT_URL

      );
    } catch (error) {
      throw new apiError(500, "failed to send email");
    }

  return res.status(201).send(
    new apiResponse(
      201,
      {
        user: {
          id: savedUser._id,
          fullName: savedUser.fullName,
          email: savedUser.email,
        },
      },
      "Signup Successfully"
    )
  );
  
  } 
  catch (error) {
    return next(new apiError(500, error.message || "SignUp failed"));
  }
};

// Login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new apiError(400, "Email and password are required"));
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return next(new apiError(404, "User not found"));
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return next(new apiError(401, "Invalid password"));
    }

    // Generate tokens
    const tokens = generateTokens({
      email: user.email,
      fullName: user.fullName,
    });

    // Save refresh token in DB
    user.refreshToken = tokens.refreshToken;
    await user.save();

    // Set cookies
    setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

    return res.status(200).send(
      new apiResponse(
        200,
        {
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
          },
        },
        "Logged in successfully"
      )
    );
  } catch (error) {
    return next(new apiError(500, error.message || "Login failed"));
  }
};

//LogOut
const logOut = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new apiError(401, "User not authenticated"));
    }
    await User.findByIdAndUpdate(req.user._id, {
      $set: {
        refreshToken: undefined,
      },
    });

    const options = {
      httpOnly: true,
      secure: ENV.NODE_ENV === "development" ? false : true,
      sameSite: "strict",
    };

    res
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .status(200)
      .json(new apiResponse(200, {}, "User logged out"));
  } catch (error) {
    return next(new apiError(500, "LogOut failed"));
  }
};

export { signUp, login, logOut };
