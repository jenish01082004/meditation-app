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
            image: result.secure_url,
            public_id: result.public_id   // 👈 SAVE THIS
        });

        res.status(201).json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        let updateData = { name };

        if (req.file) {
            // delete old image
            await cloudinary.uploader.destroy(category.public_id);

            const result = await cloudinary.uploader.upload(req.file.path);
            updateData.image = result.secure_url;
            updateData.public_id = result.public_id;
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        res.json(updatedCategory);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Delete category
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // 🔥 Delete image from Cloudinary
        await cloudinary.uploader.destroy(category.public_id);

        // Delete from DB
        await category.deleteOne();

        res.json({ message: 'Category and image deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Get all categories (optimized)
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({}, 'name image')
            .sort({ createdAt: -1 })
            .lean(); // faster, returns plain objects
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get single category by ID
exports.getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id, 'name image').lean();
        if (!category) return res.status(404).json({ message: 'Category not found' });

        res.json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
