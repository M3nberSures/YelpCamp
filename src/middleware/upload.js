const path = require('path');
const fs = require('fs');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const updloadsPath = path.join('src/public/uploads/images');
        if (!fs.existsSync(updloadsPath)) {
            fs.mkdirSync(updloadsPath);
        }
        cb(null, path.join('src/public/uploads/images'))
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});

let imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

module.exports = multer({ storage: storage, fileFilter: imageFilter }).single('image');
