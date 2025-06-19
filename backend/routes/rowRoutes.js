const express = require('express');
const router = express.Router();
const { addRow, updateRow, deleteRow } = require('../controllers/rowController');
const authMiddleware = require('../middleware/authMiddleware');
router.post('/:tableId', authMiddleware, addRow);
router.put('/:tableId/:rowId', authMiddleware, updateRow);
router.delete('/:tableId/:rowId', authMiddleware, deleteRow);
module.exports = router;