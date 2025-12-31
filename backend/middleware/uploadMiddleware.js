import multer from 'multer';
import path from 'path';

import os from 'os';

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, os.tmpdir());
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

export default upload;
