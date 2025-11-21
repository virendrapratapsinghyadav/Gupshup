import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { ApiError } from "../utils/apiError.js";
import { ENV } from "../utils/Env.js";
import { generateWebTokens, setTokenCookies } from "../controllers/auth.controller.js";

const protectedRoute = async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = req.cookies;
    if (!accessToken && !refreshToken) {
      return res.status(401).json(new ApiError(401, "Unauthorized Access"));
    }

    if (accessToken) {
      try {
        const accessDecoded = jwt.verify(accessToken, ENV.ACCESS_TOKEN_SECRET);
        const user = await User.findById(accessDecoded.id).select("-password");
        if (!user) {
          return res.status(404).json(new ApiError(404, "User not found"));
        }
        req.user = user;  //does NOT store anything in the database, it attach the authenticated user object to the request object so that downstream middleware and route handlers can access it.
        return next();
      } catch (error) {
        console.log("Access token Expired/invalid");
      }
    }

    if (refreshToken) {
      try {
        const refreshDecoded = jwt.verify(
          refreshToken,
          ENV.REFRESH_TOKEN_SECRET
        );
        const user = await User.findById(refreshDecoded.id);
        if (!user) {
          return res.status(404).json(new ApiError(404, "User not found"));
        }

        //Generate new Access token
        const { accessToken: newAccessToken } = generateWebTokens({id: user._id});

        setTokenCookies(res, newAccessToken, refreshToken);

        req.user = user;
        return next();
      } catch (error) {
        console.log("Refresh token invalid");
      }
    }

    // Neither token is valid
    return res
      .status(401)
      .json(new ApiError(401, "Unauthorized Invalid Access"));
  } catch (error) {
    console.log("Error coming from authMiddleware", error);
    return res.status(500).json(new ApiError(500, "Authentication Failed"));
  }
};

export default protectedRoute;
