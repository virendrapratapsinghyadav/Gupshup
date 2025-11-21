import express from 'express';
import { getAllContacts, getAllChats, getMessagesByUserId, sendMessage, deleteMessage } from '../controllers/message.controller.js';
import protectedRoute from '../middlewares/auth.middleware.js';


const router =  express.Router();

router.use(protectedRoute);

router.get('/contacts', getAllContacts);
router.get('/chats', getAllChats);
router.get('/:id', getMessagesByUserId);
router.post('/send/:id', sendMessage);
router.delete('/delete/:msgId', deleteMessage);

export default router;