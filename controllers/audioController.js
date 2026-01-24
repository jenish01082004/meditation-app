const Audio = require('../models/Audio');
const cloudinary = require('../utils/cloudinary');

// Upload audio
exports.createAudio = async (req, res) => {
    try {
        const { categoryId, title, description } = req.body;
        const audioFile = req.files?.audio?.[0];
        const imageFile = req.files?.image?.[0];

        if (!audioFile) return res.status(400).json({ message: 'Audio file required' });

        const audioResult = await cloudinary.uploader.upload(audioFile.path, { resource_type: "video" });
        let imageResult = null;

        if (imageFile) imageResult = await cloudinary.uploader.upload(imageFile.path);

        const audio = await Audio.create({
            categoryId,
            title,
            description,
            audioFile: audioResult.secure_url,
            image: imageResult ? imageResult.secure_url : undefined
        });

        res.status(201).json(audio);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete audio
exports.deleteAudio = async (req, res) => {
    try {
        const { id } = req.params;
        await Audio.findByIdAndDelete(id);
        res.json({ message: 'Audio deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update audio
exports.updateAudio = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, categoryId } = req.body;

        let updateData = { title, description, categoryId };

        const audioFile = req.files?.audio?.[0];
        const imageFile = req.files?.image?.[0];

        if (audioFile) {
            const audioResult = await cloudinary.uploader.upload(audioFile.path, { resource_type: "video" });
            updateData.audioFile = audioResult.secure_url;
        }

        if (imageFile) {
            const imageResult = await cloudinary.uploader.upload(imageFile.path);
            updateData.image = imageResult.secure_url;
        }

        const audio = await Audio.findByIdAndUpdate(id, updateData, { new: true });
        res.json(audio);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// Fetch audios by category
exports.fetchAudioByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        if (!categoryId) {
            return res.status(400).json({ message: 'Category ID is required' });
        }

        const audios = await Audio.find({ categoryId }).sort({ createdAt: -1 });

        res.json(audios);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
