const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const {
    createCategory,
    updateCategory,
    deleteCategory,
    getAllCategories,
    getCategoryById
} = require('../controllers/categoryController');

// Create category
router.post('/', upload.single('image'), createCategory);

// Update category
router.put('/:id', upload.single('image'), updateCategory);

// Delete category
router.delete('/:id', deleteCategory);

// Fetch all categories
router.get('/', getAllCategories);

// Fetch single category by ID
router.get('/:id', getCategoryById);

module.exports = router;
