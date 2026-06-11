const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({

    destination(req, file, cb) {
        cb(null, 'public/uploads');
    },

    filename(req, file, cb) {
        cb(
            null,
            Date.now() +
            path.extname(file.originalname)
        );
    }

});

const imageUpload = multer({

    storage,

    fileFilter(req, file, cb) {

        console.log(file.mimetype);

        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas imagens'));
        }
    }

});

module.exports = imageUpload;