const express= require('express');
const router =express.Router();
const {createTable, getUserTables, getTableById, updateTableById, deleteTable}=require('../controllers/tableController');
const authMiddleware=require('../middleware/authMiddleware');
router.post('/', authMiddleware, createTable);
router.get('/history', authMiddleware, getUserTables);
router.get('/:id', authMiddleware, getTableById);
router.put('/:id',authMiddleware,updateTableById);
router.delete('/:tableId', authMiddleware, deleteTable);

module.exports=router;
