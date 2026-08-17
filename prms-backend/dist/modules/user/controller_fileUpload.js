"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadController = void 0;
const fileUploadService = __importStar(require("./service_fileUpload"));
const service_audit_1 = require("../admin/service_audit");
const response_1 = require("../../utils/response");
const HELPERS = (req) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const ua = req.headers['user-agent'];
    const url = req.originalUrl;
    const method = req.method;
    const auth = req;
    const log = async (ctx) => {
        await (0, service_audit_1.recordAudit)({ ...ctx, userId: auth.user?.id, username: auth.user?.email || undefined, userRole: auth.user?.role, ipAddress: ip, userAgent: ua, requestUrl: url, httpMethod: method, module: 'File Upload', status: ctx.status || 'Success', level: ctx.level || 'info' });
    };
    return { log };
};
class FileUploadController {
    constructor() {
        this.upload = async (req, res) => {
            try {
                const file = req.file;
                if (!file)
                    return res.status(400).json({ success: false, error: { message: 'No file provided' } });
                const userId = req.user.id;
                const url = `/files/${file.filename}`;
                // Determine category: image or document
                const category = file.mimetype.startsWith('image/') ? 'image' : 'document';
                const result = await fileUploadService.uploadFile(userId, {
                    originalName: file.originalname,
                    storageName: file.filename,
                    mimeType: file.mimetype,
                    fileSize: file.size,
                    category,
                    url,
                    description: req.body.description || undefined,
                });
                HELPERS(req).log({ action: 'UPLOAD_FILE', entity: 'UserProfileFile', entityId: result.id, description: `Uploaded ${file.originalname}` });
                res.status(201).json((0, response_1.successResponse)(result, 'File uploaded successfully'));
            }
            catch (error) {
                HELPERS(req).log({ action: 'UPLOAD_FILE', entity: 'UserProfileFile', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.list = async (req, res) => {
            try {
                const userId = req.user.id;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const category = req.query.category;
                const { files, total } = await fileUploadService.getUserFiles(userId, page, limit, category);
                HELPERS(req).log({ action: 'LIST_FILES', entity: 'UserProfileFile', description: `Listed files (page ${page})` });
                res.json((0, response_1.paginatedResponse)(files, page, limit, total));
            }
            catch (error) {
                HELPERS(req).log({ action: 'LIST_FILES', entity: 'UserProfileFile', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.getById = async (req, res) => {
            try {
                const file = await fileUploadService.getFileById(String(req.params.id));
                if (!file)
                    return res.status(404).json({ success: false, error: { message: 'File not found' } });
                HELPERS(req).log({ action: 'VIEW_FILE', entity: 'UserProfileFile', entityId: file.id, description: `Viewed file ${file.originalName}` });
                res.json((0, response_1.successResponse)(file));
            }
            catch (error) {
                HELPERS(req).log({ action: 'VIEW_FILE', entity: 'UserProfileFile', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.remove = async (req, res) => {
            try {
                const userId = req.user.id;
                const fileId = String(req.params.id);
                // Get file details before deletion
                const file = await fileUploadService.getFileById(fileId);
                if (!file)
                    return res.status(404).json({ success: false, error: { message: 'File not found' } });
                // Ensure user can only delete their own files
                if (file.userId !== userId) {
                    return res.status(403).json({ success: false, error: { message: 'You can only delete your own files' } });
                }
                await fileUploadService.deleteFile(fileId);
                HELPERS(req).log({ action: 'DELETE_FILE', entity: 'UserProfileFile', entityId: fileId, description: `Deleted file ${file.originalName}` });
                res.json((0, response_1.successResponse)(null, 'File deleted'));
            }
            catch (error) {
                HELPERS(req).log({ action: 'DELETE_FILE', entity: 'UserProfileFile', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
    }
}
exports.FileUploadController = FileUploadController;
