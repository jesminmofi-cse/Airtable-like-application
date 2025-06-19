const express=require('express');
const router=express.Router();
const {register,login, getUserProfile}=require('../controllers/authController');
const verifyToken=require('../middleware/authMiddleware');
router.post('/register',register);
router.post('/login',login);
router.get('/me', verifyToken, getUserProfile);
module.exports=router;