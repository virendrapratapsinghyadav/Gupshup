import jwt from "jsonwebtoken";
import { ENV } from "../utils/env.js";
import { User } from "../models/User.model.js";
import { apiError } from "../utils/apiError.js";
import { generateTokens, setTokenCookies } from "../controllers/auth.controller.js";

export const protectedRoute = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (!accessToken && !refreshToken) {
      return next(new apiError(401, "Unauthorized request"));
    }

    // 1. Verify Access Token first
    try {
      const decoded = jwt.verify(accessToken, ENV.ACCESS_TOKEN_SECRET);
      req.savedUser = decoded;
      return next();
    } catch (error) {
      // Access token might just be expired
      if (error.name !== "TokenExpiredError") {
        return next(new apiError(401, "Invalid access token"));
      }
    }

    // 2. Access token expired → verify Refresh Token
    const decodedRefresh = jwt.verify(refreshToken, ENV.REFRESH_TOKEN_SECRET);
    const user = await User.findOne({ email: decodedRefresh.email });

    if (!user || user.refreshToken !== refreshToken) {
      return next(new apiError(401, "Invalid refresh token"));
    }

    // 3. Generate a new access token
    const { accessToken: newAccessToken } = generateTokens({
      email: user.email,
      fullName: user.fullName,
    });

    // 4. Set new cookies
    setTokenCookies(res, newAccessToken, refreshToken);

    // 5. Attach user to request and continue
    req.savedUser = decodedRefresh;
    next();
  } catch (error) {
    return next(new apiError(401, error.message || "User not authenticated"));
  }
};
