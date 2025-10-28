import express from 'express'


const router = express.Router();

router.post('/signUp',signUp);
router.get('/login',login);
router.get('/logOut', logOut);



export default router;