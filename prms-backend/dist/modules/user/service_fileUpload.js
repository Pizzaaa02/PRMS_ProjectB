"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = uploadFile;
exports.getUserFiles = getUserFiles;
exports.getFileById = getFileById;
exports.deleteFile = deleteFile;
const db_1 = require("../../db");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const UPLOAD_DIR = path_1.default.join(__dirname, '..', '..', 'public', 'uploads');
async function uploadFile(userId, data) {
    return db_1.prisma.userProfileFile.create({
        data: {
            userId,
            originalName: data.originalName,
            storageName: data.storageName,
            mimeType: data.mimeType,
            fileSize: data.fileSize,
            category: data.category,
            url: data.url,
            description: data.description || null,
        },
    });
}
async function getUserFiles(userId, page = 1, limit = 10, category) {
    const where = { userId };
    if (category) {
        where.category = category;
    }
    const [files, total] = await Promise.all([
        db_1.prisma.userProfileFile.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { created_at: 'desc' },
        }),
        db_1.prisma.userProfileFile.count({ where }),
    ]);
    return { files, total };
}
async function getFileById(fileId) {
    return db_1.prisma.userProfileFile.findUnique({
        where: { id: fileId },
    });
}
async function deleteFile(fileId) {
    const file = await db_1.prisma.userProfileFile.findUnique({
        where: { id: fileId },
    });
    if (!file)
        throw new Error('File not found');
    // Delete the physical file from disk
    const filePath = path_1.default.join(__dirname, '..', '..', 'public', file.url.replace(/^\/files\//, ''));
    if (fs_1.default.existsSync(filePath)) {
        fs_1.default.unlinkSync(filePath);
    }
    return db_1.prisma.userProfileFile.delete({
        where: { id: fileId },
    });
}
