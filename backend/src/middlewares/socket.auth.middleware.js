import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ENV } from "../utils/Env.js";
import cookie from "cookie";

const socketAuthMiddleware = async (socket, next) => {
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");


    const accessToken = cookies.accessToken;
    const refreshToken = cookies.refreshToken;


    if (!accessToken && !refreshToken) {
      console.log("sOCKET toKENS ABSENT");

      //ThiS is THE way to return error for sockets
      return next(new Error("Unauthorized Access from socket"));

      //or can do this to  but you need to use JSON.stringify as you cannot pass object in ERROR class as it only expect a string
      //return next(new Error(JSON.stringify( new apiError (401, "Unauthorized Access from socket"))));
    }

    if (accessToken) {
      try {
        const accessDecoded = jwt.verify(accessToken, ENV.ACCESS_TOKEN_SECRET);
        const user = await User.findById(accessDecoded.id).select("-password");
        if (!user) {
          return next(new Error("User not found from socket"));
        }
        socket.user = user;
        socket.userId = user._id.toString();
        return next();
      } catch (error) {
        console.log("Access token Expired/invalid from socket");
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
          return next(new Error("User not found from socket"));
        }

        socket.user = user;
        socket.userId = user._id.toString();
        console.log(`Socket authenticated for user: ${user.fullName} (${user._id})`);
        return next();
      } catch (error) {
        console.log("Refresh token invalid from socket");
        return next(new Error("Unauthorized - Invalid refresh token from socket"));
      }
    }

    // Neither token is valid
     return next(new Error("Unauthorized - No valid token from socket")); 


  } catch (error) {
    console.log("Error coming from socketMiddleware", error);
    return next(new Error("Authentication failed from socket"));
  }
};

export default socketAuthMiddleware;
