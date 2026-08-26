"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyIdParam = exports.updatePropertyBody = exports.createPropertyBody = void 0;
const express_validator_1 = require("express-validator");
exports.createPropertyBody = [
    (0, express_validator_1.body)('title').trim().notEmpty().isLength({ min: 3, max: 150 }).withMessage('Title must be 3-150 characters'),
    (0, express_validator_1.body)('address').trim().notEmpty().isLength({ min: 5 }).withMessage('Address must be at least 5 characters'),
    (0, express_validator_1.body)('property_type').optional().isString(),
    (0, express_validator_1.body)('description').optional().isString(),
    (0, express_validator_1.body)('rent').isFloat({ gt: 0 }).withMessage('Rent must be greater than zero'),
    (0, express_validator_1.body)('status').optional().isIn(['AVAILABLE', 'RENTED', 'MAINTENANCE', 'INACTIVE']),
    (0, express_validator_1.body)('city').optional().isString(),
    (0, express_validator_1.body)('state').optional().isString(),
    (0, express_validator_1.body)('availableFrom').optional().isISO8601(),
    (0, express_validator_1.body)('availableTo').optional().isISO8601(),
    (0, express_validator_1.body)('videoUrls').optional().isArray(),
    (0, express_validator_1.body)('documentUrls').optional().isArray(),
];
exports.updatePropertyBody = [
    // Individual validators
    (0, express_validator_1.body)('title').optional({ nullable: true }).trim().isLength({ min: 3, max: 150 }).withMessage('Title must be 3-150 characters'),
    (0, express_validator_1.body)('address').optional({ nullable: true }).trim().isLength({ min: 5 }).withMessage('Address minimum 5 characters'),
    (0, express_validator_1.body)('property_type').optional().isString(),
    (0, express_validator_1.body)('description').optional({ nullable: true }).isString(),
    (0, express_validator_1.body)('rent').optional({ nullable: true }).isFloat({ gt: 0 }).withMessage('Rent must be greater than 0'),
    (0, express_validator_1.body)('status').optional({ nullable: true }).isIn(['AVAILABLE', 'RENTED', 'MAINTENANCE', 'INACTIVE']),
    (0, express_validator_1.body)('city').optional({ nullable: true }).isString(),
    (0, express_validator_1.body)('state').optional({ nullable: true }).isString(),
    (0, express_validator_1.body)('availableFrom').optional({ nullable: true }).isISO8601(),
    (0, express_validator_1.body)('availableTo').optional({ nullable: true }).isISO8601(),
    (0, express_validator_1.body)('videoUrls').optional({ nullable: true }).isArray(),
    (0, express_validator_1.body)('documentUrls').optional({ nullable: true }).isArray(),
    // At-least-one guard
    (req, _res, next) => {
        const coreKeys = ['title', 'address', 'property_type', 'description', 'rent', 'status', 'city', 'state'];
        const hasCore = coreKeys.some((k) => req.body[k] !== undefined);
        const hasMedia = Array.isArray(req.body.images) || Array.isArray(req.body.videos) || Array.isArray(req.body.videoUrls) || Array.isArray(req.body.documentUrls);
        const hasAmenities = Array.isArray(req.body.amenities);
        const hasDates = req.body.availableFrom !== undefined || req.body.availableTo !== undefined;
        if (!hasCore && !hasMedia && !hasAmenities && !hasDates) {
            return next(new Error('At least one core field, media, amenity, or date must be present in the request'));
        }
        next();
    },
];
exports.propertyIdParam = [(0, express_validator_1.param)('id').isUUID()];
