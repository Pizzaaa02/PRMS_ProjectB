"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userIdParam = exports.userQuery = exports.updateUserBody = exports.createUserBody = void 0;
const express_validator_1 = require("express-validator");
exports.createUserBody = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    (0, express_validator_1.body)('full_name').optional().isString(),
    (0, express_validator_1.body)('phone').optional().isString(),
    (0, express_validator_1.body)('role').optional().isIn(['Admin', 'Landlord', 'Tenant', 'Agent']),
];
exports.updateUserBody = [
    (0, express_validator_1.body)('full_name').optional().isString(),
    (0, express_validator_1.body)('phone').optional().isString(),
    (0, express_validator_1.body)('is_active').optional().isBoolean(),
];
exports.userQuery = [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    (0, express_validator_1.query)('search').optional().isString(),
    (0, express_validator_1.query)('role').optional().isString(),
    (0, express_validator_1.query)('is_active').optional().isIn(['true', 'false']),
];
exports.userIdParam = [(0, express_validator_1.param)('id').isUUID()];
