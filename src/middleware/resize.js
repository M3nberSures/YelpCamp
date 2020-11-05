const sharp = require("sharp");
const path = require("path");
const fs = require('fs');

const resize = {};

resize.resizeImages = async function(req, res, next) {
    if (!req.file) return next();

    const filename = req.file.filename.split('.')[0] + '.jpg';
    const filepath = path.join(__dirname, '/../../', req.file.path);

    await sharp(filepath)
        .resize(500, 325)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`src/public/uploads/images/${filename}`);

    req.file.filename = filename;
    fs.unlinkSync(filepath);
    next();
};

module.exports = resize;
