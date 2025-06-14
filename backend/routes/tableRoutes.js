const express= require('express');
const router =express.Router();
const {createTable}=require('../controllers/tableController');
const authMiddleware=require('../middleware/authMiddleware');
router.post('/create', authMiddleware, createTable);
module.exports=router;
