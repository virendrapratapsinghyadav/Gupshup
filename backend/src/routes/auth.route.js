import express from 'express';
import { signUpValidation, loginValidation } from '../middlewares/validation.middleware.js';
import { login, logOut, signUp, updateProfile } from '../controllers/auth.controller.js';
import protectedRoute from '../middlewares/auth.middleware.js';
import { ApiResponse } from '../utils/apiResponse.js';


const router = express.Router();


router.post('/signup', signUpValidation, signUp);
router.post('/login', loginValidation, login);
router.post('/logout', logOut);
router.put('/update-profile', protectedRoute, updateProfile);

router.get("/check", protectedRoute, (req, res) => res.status(200).json(new ApiResponse(
    200,
    req.user,
    "Check Successfully fetced the user"
)));


export default router;