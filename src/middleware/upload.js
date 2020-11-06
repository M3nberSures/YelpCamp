const path = require('path');
const fs = require('fs');
const multer = require('multer');
const nanoid = require('nanoid');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const updloadsPath = path.join('src/public/uploads');
        if (!fs.existsSync(updloadsPath)) {
            fs.mkdirSync(updloadsPath);
        }
        cb(null, path.join('src/public/uploads'))
    },
    filename: async function (req, file, callback) {
        const ext = path.extname(file.originalname);
        const filename = await nanoid.nanoid() + ext;
        callback(null, filename);
    }
});

let imageFilter = function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

module.exports = multer({ storage: storage, fileFilter: imageFilter });
