const mongoose = require('mongoose');

const audioSchema = new mongoose.Schema({
    categoryId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Category', 
        required: true 
    },
    title: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String 
    },

    audioFile: { 
        type: String, 
        required: true 
    },

    audio_public_id: { 
        type: String, 
        required: true 
    },

    image: { 
        type: String 
    },

    image_public_id: { 
        type: String 
    }

}, { timestamps: true });

module.exports = mongoose.model('Audio', audioSchema);