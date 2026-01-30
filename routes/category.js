const express = require('express');
const router = express.Router();
const multer = require('multer');

// Multer setup
const upload = multer({ dest: 'uploads/' });

const {
    createCategory,
    updateCategory,
    deleteCategory,
    getAllCategories,
    getCategoryById
} = require('../controllers/categoryController');

// Routes
router.post('/', upload.single('image'), createCategory);
router.put('/:id', upload.single('image'), updateCategory);
router.delete('/:id', deleteCategory);
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

module.exports = router;
