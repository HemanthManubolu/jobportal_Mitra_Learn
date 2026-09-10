import multer from "multer";

const storage = multer.memoryStorage();
const allowedMimeTypes = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);
export const singleUpload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        if (allowedMimeTypes.has(file.mimetype)) return callback(null, true);
        const error = new Error('Only PDF, JPEG, PNG, and WebP files are allowed.'); error.status = 400;
        callback(error);
    }
}).single("file");
