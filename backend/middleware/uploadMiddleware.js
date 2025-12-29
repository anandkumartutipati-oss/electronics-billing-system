const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

function checkFileType(file, cb) {
    const filetypes = /csv|jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype) ||
        file.mimetype === 'text/csv' ||
        file.mimetype === 'application/vnd.ms-excel' ||
        file.mimetype.startsWith('image/');

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Error: CSV or Images Only!');
    }
}

const upload = multer({
    storage,
    // fileFilter: function (req, file, cb) {
    //   checkFileType(file, cb);
    // },
});

module.exports = upload;
