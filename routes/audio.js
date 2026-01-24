const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const { createAudio, deleteAudio, updateAudio } = require('../controllers/audioController');
const { fetchAudioByCategory } = require('../controllers/audioController');

// Existing routes...
router.get('/category/:categoryId', fetchAudioByCategory);

router.post('/', upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'image', maxCount: 1 }]), createAudio);
router.put('/:id', upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'image', maxCount: 1 }]), updateAudio);
router.delete('/:id', deleteAudio);


module.exports = router;
