"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.successResponse = void 0;
exports.uploadFile = uploadFile;
exports.getUserFiles = getUserFiles;
exports.getUserMedia = getUserMedia;
exports.getFileById = getFileById;
exports.deleteFile = deleteFile;
exports.deletePropertyImage = deletePropertyImage;
const db_1 = require("../../db");
const response_1 = require("../../utils/response");
Object.defineProperty(exports, "successResponse", { enumerable: true, get: function () { return response_1.successResponse; } });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const thumbnail_1 = require("../../services/thumbnail");
const UPLOAD_DIR = path_1.default.join(__dirname, '..', '..', 'public', 'uploads');
async function uploadFile(userId, data) {
    // Generate thumbnail for images
    let thumbnailUrl = null;
    const filePath = path_1.default.join(__dirname, '..', '..', 'public', data.url.replace(/^\/files\//, ''));
    try {
        const thumbInfo = await (0, thumbnail_1.generateThumbnail)({
            filePath,
            mimeType: data.mimeType,
            originalName: data.originalName,
        });
        if (thumbInfo) {
            thumbnailUrl = thumbInfo.url;
        }
    }
    catch (err) {
        console.error('service_fileUpload: thumbnail generation failed', err);
    }
    return db_1.prisma.userProfileFile.create({
        data: {
            userId,
            originalName: data.originalName,
            storageName: data.storageName,
            mimeType: data.mimeType,
            fileSize: data.fileSize,
            category: data.category,
            url: data.url,
            thumbnailUrl,
            description: data.description || null,
        },
    });
}
// Get user profile files (paginated)
async function getUserFiles(userId, page = 1, limit = 10, category) {
    const where = { userId };
    if (category)
        where.category = category;
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
// Get ALL media (user files + property images) for a user
async function getUserMedia(userId, fileType) {
    const [userFiles, propertyImages] = await Promise.all([
        db_1.prisma.userProfileFile.findMany({
            where: { userId },
            include: { user: true },
        }),
        db_1.prisma.propertyImage.findMany({
            where: { property: { ownerId: userId } },
            include: { property: true },
        }),
    ]);
    const media = userFiles.map((f) => ({
        id: f.id,
        name: f.originalName,
        url: f.url,
        size: f.fileSize,
        mime_type: f.mimeType,
        thumbnail_url: f.thumbnailUrl,
        date_added: f.created_at.toISOString(),
        type: 'user',
        file_type: 'user',
    }));
    propertyImages.forEach((img) => {
        const mediaItem = {
            id: img.id,
            name: img.url.split('/').pop() || 'image',
            url: img.url,
            size: null,
            mime_type: 'image/jpeg',
            thumbnail_url: null,
            date_added: img.created_at.toISOString(),
            type: 'property',
            file_type: 'property',
            property_title: img.property?.title,
        };
        media.push(mediaItem);
    });
    return media;
}
async function getFileById(fileId) {
    const file = await db_1.prisma.userProfileFile.findUnique({
        where: { id: fileId },
    });
    return file || null;
}
async function deleteFile(fileId) {
    const file = await db_1.prisma.userProfileFile.findUnique({
        where: { id: fileId },
    });
    if (!file)
        throw new Error('File not found');
    const filePath = path_1.default.join(__dirname, '..', '..', 'public', file.url.replace(/^\/files\//, ''));
    if (fs_1.default.existsSync(filePath)) {
        fs_1.default.unlinkSync(filePath);
    }
    if (file.thumbnailUrl) {
        const thumbStorageName = file.thumbnailUrl.replace(/^\/api\/files\/thumbnails\//, '');
        await (0, thumbnail_1.deleteThumbnail)(thumbStorageName);
    }
    return db_1.prisma.userProfileFile.delete({
        where: { id: fileId },
    });
}
// Delete a property image by its image ID
async function deletePropertyImage(imageId) {
    const image = await db_1.prisma.propertyImage.findUnique({
        where: { id: imageId },
    });
    if (!image)
        throw new Error('Property image not found');
    const filePath = path_1.default.join(__dirname, '..', '..', 'public', image.url.replace(/^\/images\//, ''));
    if (fs_1.default.existsSync(filePath)) {
        fs_1.default.unlinkSync(filePath);
    }
    return db_1.prisma.propertyImage.delete({
        where: { id: imageId },
    });
}
