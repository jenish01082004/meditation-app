const Audio = require('../models/Audio');
const cloudinary = require('../utils/cloudinary');
const path = require('path');


// CREATE AUDIO
exports.createAudio = async (req, res) => {
    try {
        const { categoryId, title, description } = req.body;

        const audioFile = req.files?.audio?.[0];
        const imageFile = req.files?.image?.[0];

        if (!audioFile) {
            return res.status(400).json({ message: "Audio file required" });
        }

        const audioResult = await cloudinary.uploader.upload(audioFile.path, {
            resource_type: "video"
        });

        let imageResult = null;

        if (imageFile) {
            imageResult = await cloudinary.uploader.upload(imageFile.path);
        }

        const audioFileName = path.basename(audioResult.secure_url);
        const imageFileName = imageResult ? path.basename(imageResult.secure_url) : null;

        const audio = await Audio.create({
            categoryId,
            title,
            description,
            audioFile: audioFileName,
            audio_public_id: audioResult.public_id,
            image: imageFileName || undefined,
            image_public_id: imageResult ? imageResult.public_id : undefined
        });

        res.status(201).json(audio);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



// DELETE AUDIO
exports.deleteAudio = async (req, res) => {
    try {

        const { id } = req.params;

        const audio = await Audio.findById(id);

        if (!audio) {
            return res.status(404).json({ message: "Audio not found" });
        }

        // Delete audio from Cloudinary
        if (audio.audio_public_id) {
            await cloudinary.uploader.destroy(audio.audio_public_id, {
                resource_type: "video"
            });
        }

        // Delete image
        if (audio.image_public_id) {
            await cloudinary.uploader.destroy(audio.image_public_id);
        }

        // Delete from MongoDB
        await Audio.findByIdAndDelete(id);

        res.json({
            message: "Audio and image deleted successfully"
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



// UPDATE AUDIO
exports.updateAudio = async (req, res) => {
    try {

        const { id } = req.params;
        const { title, description, categoryId } = req.body;

        const audio = await Audio.findById(id);

        if (!audio) {
            return res.status(404).json({ message: "Audio not found" });
        }

        let updateData = { title, description, categoryId };

        const audioFile = req.files?.audio?.[0];
        const imageFile = req.files?.image?.[0];


        if (audioFile) {

            await cloudinary.uploader.destroy(audio.audio_public_id, {
                resource_type: "video"
            });

            const audioResult = await cloudinary.uploader.upload(audioFile.path, {
                resource_type: "video"
            });

            updateData.audioFile = path.basename(audioResult.secure_url);
            updateData.audio_public_id = audioResult.public_id;
        }


        if (imageFile) {

            if (audio.image_public_id) {
                await cloudinary.uploader.destroy(audio.image_public_id);
            }

            const imageResult = await cloudinary.uploader.upload(imageFile.path);

            updateData.image = path.basename(imageResult.secure_url);
            updateData.image_public_id = imageResult.public_id;
        }


        const updatedAudio = await Audio.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        res.json(updatedAudio);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



// FETCH AUDIO BY CATEGORY
exports.fetchAudioByCategory = async (req, res) => {
    try {

        const { categoryId } = req.params;

        if (!categoryId) {
            return res.status(400).json({ message: "Category ID required" });
        }

        const audios = await Audio.find({ categoryId })
            .sort({ createdAt: -1 })
            .lean();

        const result = audios.map(a => ({
            ...a,
            audioFile: `${process.env.AUDIO_BASE_URL}/${a.audioFile}`,
            image: a.image ? `${process.env.IMAGE_BASE_URL}/${a.image}` : null
        }));

        res.json(result);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.searchAudio = async (req, res) => {

    try {

        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ message: "Search query required" });
        }

        const audios = await Audio.find({
            title: { $regex: q, $options: "i" }
        }).lean();

        const result = audios.map(a => ({
            ...a,
            audioFile: `${process.env.AUDIO_BASE_URL}/${a.audioFile}`,
            image: a.image ? `${process.env.IMAGE_BASE_URL}/${a.image}` : null
        }));

        res.json(result);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }

};