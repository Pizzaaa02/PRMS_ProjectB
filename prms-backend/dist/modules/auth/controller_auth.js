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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const express_validator_1 = require("express-validator");
const authService = __importStar(require("./service_auth"));
const service_audit_1 = require("../admin/service_audit");
const response_1 = require("../../utils/response");
const config_1 = require("../../config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const firebase_auth_1 = require("./firebase_auth");
const db_1 = require("../../db");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const HELPERS = (req) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const ua = req.headers['user-agent'];
    const url = req.originalUrl;
    const method = req.method;
    const log = async (ctx) => {
        await (0, service_audit_1.recordAudit)({ ...ctx, username: ctx.username || undefined, ipAddress: ip, userAgent: ua, requestUrl: url, httpMethod: method, module: 'Authentication' });
    };
    return { log };
};
class AuthController {
    constructor() {
        this.register = async (req, res) => {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, error: { message: errors.array()[0].msg } });
            }
            try {
                const { email, password, full_name, phone, role } = req.body;
                const user = await authService.registerUser(email, password, full_name, phone, role);
                const tokens = authService.generateTokens(user.id);
                await authService.saveRefreshToken(user.id, tokens.refreshToken);
                HELPERS(req).log({ userId: user.id, username: user.email, userRole: role || 'Tenant', action: 'USER_REGISTRATION', entity: 'User', entityId: user.id, description: `New user registered with role ${role || 'Tenant'}`, status: 'Success', level: 'info' });
                res.status(201).json((0, response_1.successResponse)({
                    user: { id: user.id, email: user.email, full_name: user.full_name },
                    tokens,
                }, 'Registration successful'));
            }
            catch (error) {
                HELPERS(req).log({ action: 'USER_REGISTRATION', entity: 'User', description: `Registration failed: ${error.message}`, status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.login = async (req, res) => {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, error: { message: errors.array()[0].msg } });
            }
            try {
                const { email, password } = req.body;
                const user = await authService.loginUser(email, password);
                const tokens = authService.generateTokens(user.id);
                await authService.saveRefreshToken(user.id, tokens.refreshToken);
                HELPERS(req).log({ userId: user.id, username: user.email, userRole: user.UserRole[0]?.role.name, action: 'USER_LOGIN', entity: 'User', entityId: user.id, description: 'User logged in successfully', status: 'Success', level: 'info' });
                res.json((0, response_1.successResponse)({
                    user: {
                        id: user.id,
                        email: user.email,
                        full_name: user.full_name,
                        firebase_uid: user.firebase_uid,
                        role: user.UserRole[0]?.role.name,
                    },
                    tokens,
                }, 'Login successful'));
            }
            catch (error) {
                HELPERS(req).log({ action: 'USER_LOGIN', entity: 'User', description: `Login failed: ${error.message}`, status: 'Failed', level: 'warning', errorMessage: error.message });
                res.status(401).json({ success: false, error: { message: error.message } });
            }
        };
        this.refresh = async (req, res) => {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, error: { message: errors.array()[0].msg } });
            }
            try {
                const { refreshToken } = req.body;
                const decoded = jsonwebtoken_1.default.verify(refreshToken, config_1.env.JWT_REFRESH_SECRET);
                await authService.verifyRefreshToken(decoded.userId, refreshToken);
                const tokens = authService.generateTokens(decoded.userId);
                await authService.saveRefreshToken(decoded.userId, tokens.refreshToken);
                res.json((0, response_1.successResponse)({ tokens }, 'Token refreshed'));
            }
            catch (error) {
                res.status(401).json({ success: false, error: { message: error.message } });
            }
        };
        this.getMe = async (req, res) => {
            try {
                const user = await authService.getCurrentUser(req.user.id);
                if (!user) {
                    res.status(404).json({ success: false, error: { message: 'User not found' } });
                    return;
                }
                res.json((0, response_1.successResponse)({
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    phone: user.phone,
                    profile_img_url: user.profile_img_url,
                    firebase_uid: user.firebase_uid,
                    role: user.UserRole[0]?.role.name || 'Tenant',
                }));
            }
            catch (error) {
                res.status(404).json({ success: false, error: { message: error.message } });
            }
        };
        this.updateMe = async (req, res) => {
            try {
                const user = await authService.updateUserProfile(req.user.id, req.body);
                HELPERS(req).log({ userId: req.user.id, username: req.user.email, userRole: req.user.role, action: 'PROFILE_UPDATE', entity: 'User', entityId: req.user.id, description: 'User profile updated', status: 'Success', level: 'info' });
                res.json((0, response_1.successResponse)(user, 'Profile updated'));
            }
            catch (error) {
                HELPERS(req).log({ userId: req.user?.id, username: req.user?.email, action: 'PROFILE_UPDATE', entity: 'User', description: `Profile update failed: ${error.message}`, status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.logout = async (req, res) => {
            try {
                await authService.logoutUser(req.user.id);
                HELPERS(req).log({ userId: req.user.id, username: req.user.email, userRole: req.user.role, action: 'USER_LOGOUT', entity: 'User', entityId: req.user.id, description: 'User logged out', status: 'Success', level: 'info' });
                res.json((0, response_1.successResponse)(null, 'Logged out successfully'));
            }
            catch (error) {
                HELPERS(req).log({ userId: req.user?.id, username: req.user?.email, action: 'USER_LOGOUT', entity: 'User', description: `Logout failed: ${error.message}`, status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.changePassword = async (req, res) => {
            try {
                const { currentPassword, newPassword } = req.body;
                if (!currentPassword || !newPassword) {
                    return res.status(400).json({ success: false, error: { message: 'Current and new password required' } });
                }
                await authService.changePassword(req.user.id, currentPassword, newPassword);
                HELPERS(req).log({ userId: req.user.id, username: req.user.email, userRole: req.user.role, action: 'PASSWORD_CHANGE', entity: 'User', entityId: req.user.id, description: 'Password changed successfully', status: 'Success', level: 'info' });
                res.json((0, response_1.successResponse)(null, 'Password changed successfully'));
            }
            catch (error) {
                HELPERS(req).log({ userId: req.user?.id, username: req.user?.email, action: 'PASSWORD_CHANGE', entity: 'User', description: `Password change failed: ${error.message}`, status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.googleLogin = async (req, res) => {
            try {
                const { idToken, email, displayName } = req.body;
                let isNewUser = false;
                let firebaseUid;
                if (config_1.env.ENABLE_FIREBASE_VERIFY === true) {
                    if (!idToken) {
                        throw new Error('Firebase ID token required');
                    }
                    firebaseUid = await (0, firebase_auth_1.verifyFirebaseToken)(idToken);
                }
                else {
                    if (!email) {
                        throw new Error('Email is required when Firebase verification is disabled');
                    }
                    firebaseUid = `dev-${email.toLowerCase()}`;
                }
                // Step 1: find by firebase_uid
                let user = await db_1.prisma.user.findUnique({ where: { firebase_uid: firebaseUid }, include: { UserRole: { include: { role: true } } } });
                // Step 2: not found, find by email
                if (!user && email) {
                    user = await db_1.prisma.user.findUnique({ where: { email }, include: { UserRole: { include: { role: true } } } });
                    if (user) {
                        if (user.firebase_uid && user.firebase_uid !== firebaseUid) {
                            throw new Error('Google account already linked');
                        }
                        user = await db_1.prisma.user.update({ where: { id: user.id }, data: { firebase_uid: firebaseUid }, include: { UserRole: { include: { role: true } } } });
                    }
                }
                // Step 3: create new user
                if (!user) {
                    isNewUser = true;
                    user = await db_1.prisma.user.create({
                        data: { firebase_uid: firebaseUid, email, full_name: displayName || '', passwordHash: null, UserRole: { create: { role: { connect: { name: 'Tenant' } } } } },
                        include: { UserRole: { include: { role: true } } },
                    });
                }
                if (!user.is_active)
                    throw new Error('Account is suspended');
                const tokens = authService.generateTokens(user.id);
                await authService.saveRefreshToken(user.id, tokens.refreshToken);
                HELPERS(req).log({ userId: user.id, username: user.email, userRole: user.UserRole[0]?.role.name || 'Tenant', action: 'GOOGLE_LOGIN', entity: 'User', entityId: user.id, description: isNewUser ? 'New Google user registered and logged in' : 'User logged in via Google', status: 'Success', level: 'info' });
                res.json((0, response_1.successResponse)({
                    user: {
                        id: user.id,
                        email: user.email,
                        full_name: user.full_name,
                        phone: user.phone,
                        profile_img_url: user.profile_img_url,
                        role: user.UserRole[0]?.role.name || 'Tenant',
                    },
                    tokens,
                    isNewUser: !!isNewUser,
                }));
            }
            catch (error) {
                HELPERS(req).log({ action: 'GOOGLE_LOGIN', entity: 'User', description: `Google login failed: ${error.message}`, status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.uploadProfileImage = async (req, res) => {
            try {
                console.log('[DBG-UP1] userId:', req.user?.id, '| file:', req.file ? req.file.filename : 'UNDEFINED', '| ct:', req.headers['content-type']);
                if (!req.file) {
                    return res.status(400).json({ success: false, error: { message: 'No file uploaded' } });
                }
                const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                if (!allowedMimes.includes(req.file.mimetype)) {
                    fs_1.default.unlink(req.file.path, () => { });
                    return res.status(400).json({ success: false, error: { message: 'Invalid file type. Use JPEG, PNG, GIF or WebP' } });
                }
                if (req.file.size > 5 * 1024 * 1024) {
                    fs_1.default.unlink(req.file.path, () => { });
                    return res.status(400).json({ success: false, error: { message: 'File too large. Maximum 5MB' } });
                }
                // Build public URL (static route /images -> public/images/)
                const url = `/images/${path_1.default.basename(req.file.path)}`;
                // Delete old avatar file if it exists
                const oldUrl = req.user.profile_img_url;
                if (oldUrl && oldUrl.includes('/uploads/images/')) {
                    const oldFilename = path_1.default.basename(decodeURIComponent(oldUrl));
                    const oldPath = path_1.default.join(__dirname, '..', '..', 'public', 'images', oldFilename);
                    fs_1.default.unlink(oldPath, () => { });
                }
                const updated = await authService.updateUserProfile(req.user.id, { profile_img_url: url });
                HELPERS(req).log({ userId: req.user.id, username: req.user.email, userRole: req.user.role, action: 'PROFILE_IMAGE_UPLOAD', entity: 'User', entityId: req.user.id, description: 'Profile image uploaded', status: 'Success', level: 'info' });
                res.json((0, response_1.successResponse)({ profile_img_url: updated.profile_img_url }, 'Profile image updated'));
            }
            catch (error) {
                HELPERS(req).log({ userId: req.user?.id, username: req.user?.email, action: 'PROFILE_IMAGE_UPLOAD', entity: 'User', description: `Profile image upload failed: ${error.message}`, status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
    }
}
exports.AuthController = AuthController;
