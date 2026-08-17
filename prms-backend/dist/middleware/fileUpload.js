"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const UPLOAD_DIR = path_1.default.join(__dirname, '..', '..', 'public', 'uploads');
if (!fs_1.default.existsSync(UPLOAD_DIR)) {
    fs_1.default.mkdirSync(UPLOAD_DIR, { recursive: true });
}
const ALLOWED_EXTENSIONS = new Set([
    // Images
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg',
    // Documents
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.txt', '.csv', '.rtf', '.odt',
]);
const storage = multer_1.default.diskStorage({
    destination: (req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const id = req.user?.id || 'guest';
        const ts = Date.now();
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : '.bin';
        cb(null, `${id}-${ts}-${Math.random().toString(36).slice(2, 8)}${safeExt}`);
    },
});
const fileFilter = (_req, file, cb) => {
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    if (ALLOWED_EXTENSIONS.has(ext)) {
        cb(null, true);
    }
    else {
        cb(new Error(`File type ${ext} is not allowed. Allowed: images (jpg, jpeg, png, gif, webp, bmp, svg) and documents (pdf, doc, docx, xls, xlsx, ppt, pptx, txt, csv, rtf, odt)`));
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB for documents
});
exports.default = upload;
