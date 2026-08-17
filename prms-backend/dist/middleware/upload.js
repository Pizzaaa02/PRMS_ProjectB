"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const IMAGE_DIR = path_1.default.join(__dirname, '..', '..', 'public', 'images');
if (!fs_1.default.existsSync(IMAGE_DIR)) {
    fs_1.default.mkdirSync(IMAGE_DIR, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, _file, cb) => cb(null, IMAGE_DIR),
    filename: (req, file, cb) => {
        const id = req.user?.id || 'guest';
        const ts = Date.now();
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        const safeExt = ['/jpg', '/jpeg', '/png', '/gif', '/webp', '/bmp'].includes(ext) ? ext : '.jpg';
        cb(null, `${id}-${ts}-${Math.random().toString(36).slice(2, 8)}${safeExt}`);
    },
});
const fileFilter = (_req, file, cb) => {
    if (file.mimetype.startsWith('image/'))
        cb(null, true);
    else
        cb(new Error('Only image files are allowed'));
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});
exports.default = upload;
