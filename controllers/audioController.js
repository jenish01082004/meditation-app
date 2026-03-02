const Audio = require('../models/Audio');
const cloudinary = require('../utils/cloudinary');


// CREATE AUDIO
exports.createAudio = async (req, res) => {
    try {
        const { categoryId, title, description } = req.body;

        const audioFile = req.files?.audio?.[0];
        const imageFile = req.files?.image?.[0];

        if (!audioFile) {
            return res.status(400).json({ message: "Audio file required" });
        }

        // Upload audio
        const audioResult = await cloudinary.uploader.upload(audioFile.path, {
            resource_type: "video"
        });

        let imageResult = null;

        if (imageFile) {
            imageResult = await cloudinary.uploader.upload(imageFile.path);
        }

        const audio = await Audio.create({
            categoryId,
            title,
            description,
            audioFile: audioResult.secure_url,
            audio_public_id: audioResult.public_id,
            image: imageResult ? imageResult.secure_url : undefined,
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
        await cloudinary.uploader.destroy(audio.audio_public_id, {
            resource_type: "video"
        });

        // Delete image if exists
        if (audio.image_public_id) {
            await cloudinary.uploader.destroy(audio.image_public_id);
        }

        await audio.deleteOne();

        res.json({ message: "Audio deleted successfully" });

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


        // Update audio file
        if (audioFile) {

            await cloudinary.uploader.destroy(audio.audio_public_id, {
                resource_type: "video"
            });

            const audioResult = await cloudinary.uploader.upload(audioFile.path, {
                resource_type: "video"
            });

            updateData.audioFile = audioResult.secure_url;
            updateData.audio_public_id = audioResult.public_id;
        }


        // Update image
        if (imageFile) {

            if (audio.image_public_id) {
                await cloudinary.uploader.destroy(audio.image_public_id);
            }

            const imageResult = await cloudinary.uploader.upload(imageFile.path);

            updateData.image = imageResult.secure_url;
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
            .sort({ createdAt: -1 });

        res.json(audios);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};