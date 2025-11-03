import express from 'express';
import { signUp, login, logOut, updateProfile } from '../controllers/auth.controller.js';
import { protectedRoute } from '../middlewares/auth.middleware.js';
import { apiResponse } from '../utils/apiResponse.js';
import { arcjetProtection } from '../middlewares/archjet.middleware.js';

const router = express.Router();

// router.use(arcjetProtection);

router.post('/signup', signUp);
router.post('/login', login);
router.post('/logout', logOut);
router.put('/update-profile', protectedRoute, updateProfile);

router.get("/check", protectedRoute, (req, res)=>res.status(200).json(new apiResponse(200, req.user, "User is authenticated")))

export default router;