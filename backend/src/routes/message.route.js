import express from 'express';
import { getAllContacts, getMessagesByUserId, sendMessage, getChatPartners } from '../controllers/message.controller.js';
import { protectedRoute } from '../middlewares/auth.middleware.js';
import { arcjetProtection } from '../middlewares/archjet.middleware.js';

const router = express.Router();

router.use(arcjetProtection ,protectedRoute);

router.get("/contacts", getAllContacts);
router.get('/chats', getChatPartners);
router.get("/:id", getMessagesByUserId);

router.post("/send/:id", sendMessage);

export default router;