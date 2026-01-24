const Category = require('../models/Category');
const cloudinary = require('../utils/cloudinary');

// Create category
exports.createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const file = req.file;

        if (!file) return res.status(400).json({ message: 'Image is required' });

        const result = await cloudinary.uploader.upload(file.path);

        const category = await Category.create({
            name,
            image: result.secure_url
        });

        res.status(201).json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update category
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        let updateData = { name };

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            updateData.image = result.secure_url;
        }

        const category = await Category.findByIdAndUpdate(id, updateData, { new: true });

        res.json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete category
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        await Category.findByIdAndDelete(id);

        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get single category by ID
exports.getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        res.json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
