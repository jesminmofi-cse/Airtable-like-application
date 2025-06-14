const express=require('express');
const router=express.Router();
const {addRow}=require('../controllers/rowController');
const authMiddleware=require('../middleware/authMiddleware');
router.post('/:tableId/add-row',authMiddleware,addRow);
module.exports=router;