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
exports.PropertyController = void 0;
const express_validator_1 = require("express-validator");
const propertyService = __importStar(require("./service_property"));
const response_1 = require("../../utils/response");
const service_audit_1 = require("../admin/service_audit");
const db_1 = require("../../db");
const HELPERS = (req) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const ua = req.headers['user-agent'];
    const url = req.originalUrl;
    const method = req.method;
    const auth = req;
    const log = async (ctx) => {
        await (0, service_audit_1.recordAudit)({ ...ctx, userId: auth.user?.id, username: auth.user?.email || undefined, userRole: auth.user?.role, ipAddress: ip, userAgent: ua, requestUrl: url, httpMethod: method, module: 'Property', status: ctx.status || 'Success', level: ctx.level || 'info' });
    };
    return { log };
};
class PropertyController {
    constructor() {
        this.list = async (req, res) => {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const { properties, total } = await propertyService.getAllProperties(page, limit);
                HELPERS(req).log({ action: 'VIEW_PROPERTIES', entity: 'Property', description: `Listed properties (page ${page})` });
                res.json((0, response_1.paginatedResponse)(properties, page, limit, total));
            }
            catch (error) {
                HELPERS(req).log({ action: 'VIEW_PROPERTIES', entity: 'Property', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.getById = async (req, res) => {
            try {
                const property = await propertyService.getPropertyById(String(req.params.id));
                if (!property)
                    return res.status(404).json({ success: false, error: { message: 'Property not found' } });
                HELPERS(req).log({ action: 'VIEW_PROPERTY', entity: 'Property', entityId: property?.id, description: `Viewed property ${property?.title || req.params.id}` });
                res.json((0, response_1.successResponse)(property));
            }
            catch (error) {
                HELPERS(req).log({ action: 'VIEW_PROPERTY', entity: 'Property', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.create = async (req, res) => {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty())
                return res.status(400).json({ success: false, error: { message: errors.array()[0].msg } });
            try {
                const property = await propertyService.createProperty(req.body, req.user.id);
                HELPERS(req).log({ action: 'CREATE_PROPERTY', entity: 'Property', entityId: property?.id, description: `Created property ${property?.title}` });
                res.status(201).json((0, response_1.successResponse)(property, 'Property created'));
            }
            catch (error) {
                HELPERS(req).log({ action: 'CREATE_PROPERTY', entity: 'Property', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.update = async (req, res) => {
            try {
                const property = await propertyService.updateProperty(String(req.params.id), req.body);
                HELPERS(req).log({ action: 'UPDATE_PROPERTY', entity: 'Property', entityId: property?.id, description: `Updated property ${property?.title || req.params.id}` });
                res.json((0, response_1.successResponse)(property, 'Property updated'));
            }
            catch (error) {
                HELPERS(req).log({ action: 'UPDATE_PROPERTY', entity: 'Property', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.deactivate = async (req, res) => {
            try {
                const prop = await propertyService.getPropertyById(String(req.params.id));
                await propertyService.deactivateProperty(String(req.params.id));
                HELPERS(req).log({ action: 'DEACTIVATE_PROPERTY', entity: 'Property', entityId: prop?.id, description: `Deactivated property ${prop?.title || prop?.id}` });
                res.json((0, response_1.successResponse)(null, 'Property deactivated'));
            }
            catch (error) {
                HELPERS(req).log({ action: 'DEACTIVATE_PROPERTY', entity: 'Property', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.addImage = async (req, res) => {
            try {
                const file = req.file;
                if (!file)
                    return res.status(400).json({ success: false, error: { message: 'No image file provided' } });
                const url = `/uploads/properties/${file.filename}`;
                const image = await propertyService.addImage(String(req.params.id), url);
                HELPERS(req).log({ action: 'ADD_PROPERTY_IMAGE', entity: 'Property', entityId: String(req.params.id), description: `Added image to property` });
                res.status(201).json((0, response_1.successResponse)(image));
            }
            catch (error) {
                HELPERS(req).log({ action: 'ADD_PROPERTY_IMAGE', entity: 'Property', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.deleteImage = async (req, res) => {
            try {
                const image = await propertyService.getImageById(String(req.params.imageId));
                await propertyService.deleteImage(String(req.params.imageId));
                if (image?.url) {
                    const fs = await Promise.resolve().then(() => __importStar(require('fs')));
                    const path = await Promise.resolve().then(() => __importStar(require('path')));
                    const filePath = path.join(__dirname, '..', '..', '..', 'uploads', 'properties', image.url.replace(/^\/uploads\/properties\//, ''));
                    fs.promises.unlink(filePath).catch(() => { });
                }
                HELPERS(req).log({ action: 'DELETE_PROPERTY_IMAGE', entity: 'PropertyImage', entityId: String(req.params.imageId), description: `Deleted property image` });
                res.json((0, response_1.successResponse)(null, 'Image deleted'));
            }
            catch (error) {
                HELPERS(req).log({ action: 'DELETE_PROPERTY_IMAGE', entity: 'PropertyImage', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.myProperties = async (req, res) => {
            try {
                const properties = await propertyService.getLandlordProperties(req.user.id);
                HELPERS(req).log({ action: 'VIEW_MY_PROPERTIES', entity: 'Property', description: `Viewed own properties` });
                res.json((0, response_1.successResponse)(properties));
            }
            catch (error) {
                HELPERS(req).log({ action: 'VIEW_MY_PROPERTIES', entity: 'Property', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.addVideo = async (req, res) => {
            try {
                const file = req.file;
                if (!file)
                    return res.status(400).json({ success: false, error: { message: 'No video file provided' } });
                const url = `/uploads/properties/${file.filename}`;
                // Generate thumbnail for video
                let thumbnailUrl = '';
                try {
                    const { generateThumbnail } = await Promise.resolve().then(() => __importStar(require('../../utils/generateThumbnail')));
                    const path = await Promise.resolve().then(() => __importStar(require('path')));
                    const sourcePath = path.join(__dirname, '..', '..', '..', 'uploads', 'properties', file.filename);
                    thumbnailUrl = await generateThumbnail(sourcePath);
                }
                catch (e) {
                    console.warn('Video thumbnail generation skipped:', e);
                }
                const image = await propertyService.addImage(String(req.params.id), url, thumbnailUrl || undefined);
                // Override type to 'video' since addImage defaults to 'image'
                await db_1.prisma.propertyImage.update({
                    where: { id: image.id },
                    data: { type: 'video' },
                });
                HELPERS(req).log({ action: 'ADD_PROPERTY_VIDEO', entity: 'Property', entityId: String(req.params.id), description: `Added video to property` });
                res.status(201).json((0, response_1.successResponse)(image));
            }
            catch (error) {
                HELPERS(req).log({ action: 'ADD_PROPERTY_VIDEO', entity: 'Property', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.deleteVideo = async (req, res) => {
            try {
                const urlToRemove = req.body?.url || req.query.url;
                if (!urlToRemove)
                    return res.status(400).json({ success: false, error: { message: 'Video URL required in body or query' } });
                const prop = await propertyService.removeVideoFromProperty(String(req.params.id), urlToRemove);
                if (prop === null)
                    return res.status(404).json({ success: false, error: { message: 'Video URL not found on this property' } });
                // Clean up file from disk
                if (urlToRemove) {
                    const fs = await Promise.resolve().then(() => __importStar(require('fs')));
                    const path = await Promise.resolve().then(() => __importStar(require('path')));
                    const filePath = path.join(__dirname, '..', '..', '..', 'uploads', 'properties', urlToRemove.replace(/^\/uploads\/properties\//, ''));
                    fs.promises.unlink(filePath).catch(() => { });
                }
                HELPERS(req).log({ action: 'DELETE_PROPERTY_VIDEO', entity: 'Property', entityId: String(req.params.id), description: `Removed video from property` });
                res.json((0, response_1.successResponse)(prop, 'Video deleted'));
            }
            catch (error) {
                HELPERS(req).log({ action: 'DELETE_PROPERTY_VIDEO', entity: 'Property', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.addDocument = async (req, res) => {
            try {
                const file = req.file;
                if (!file)
                    return res.status(400).json({ success: false, error: { message: 'No document file provided' } });
                const url = `/uploads/properties/${file.filename}`;
                // Store document as PropertyImage with type='document' and original filename
                const image = await db_1.prisma.propertyImage.create({
                    data: {
                        propertyId: String(req.params.id),
                        url,
                        type: 'document',
                        documentName: file.originalname,
                    },
                });
                HELPERS(req).log({ action: 'ADD_PROPERTY_DOCUMENT', entity: 'Property', entityId: String(req.params.id), description: `Added document to property` });
                res.status(201).json((0, response_1.successResponse)(image));
            }
            catch (error) {
                HELPERS(req).log({ action: 'ADD_PROPERTY_DOCUMENT', entity: 'Property', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.deleteDocument = async (req, res) => {
            try {
                const urlToRemove = req.body?.url || req.query.url;
                if (!urlToRemove)
                    return res.status(400).json({ success: false, error: { message: 'Document URL required in body or query' } });
                const prop = await propertyService.removeDocumentFromProperty(String(req.params.id), urlToRemove);
                if (prop === null)
                    return res.status(404).json({ success: false, error: { message: 'Document URL not found on this property' } });
                // Clean up file from disk
                if (urlToRemove) {
                    const fs = await Promise.resolve().then(() => __importStar(require('fs')));
                    const path = await Promise.resolve().then(() => __importStar(require('path')));
                    const filePath = path.join(__dirname, '..', '..', '..', 'uploads', 'properties', urlToRemove.replace(/^\/uploads\/properties\//, ''));
                    fs.promises.unlink(filePath).catch(() => { });
                }
                HELPERS(req).log({ action: 'DELETE_PROPERTY_DOCUMENT', entity: 'Property', entityId: String(req.params.id), description: `Removed document from property` });
                res.json((0, response_1.successResponse)(prop, 'Document deleted'));
            }
            catch (error) {
                HELPERS(req).log({ action: 'DELETE_PROPERTY_DOCUMENT', entity: 'Property', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
    }
}
exports.PropertyController = PropertyController;
