const sharp = require("sharp");
const path = require("path");
const fs = require('fs');

const resize = {};

resize.resizeImages = async function(req, res, next) {
    if (!req.file) return next();
    const filename = req.file.filename;
    const filepath = path.join(__dirname, '/../../', req.file.path);
    const imagesPath = path.join('src/public/uploads/images');
    if (!fs.existsSync(imagesPath)) {
        fs.mkdirSync(imagesPath);
    }
    try {
        await sharp(filepath)
            .resize(500, 325)
            .toFile(`src/public/uploads/images/${filename}`);

    } catch (e) {
        req.flash("error", e.message);
        return res.redirect('back');
    }

    fs.unlinkSync(filepath);
    next();
};

module.exports = resize;
