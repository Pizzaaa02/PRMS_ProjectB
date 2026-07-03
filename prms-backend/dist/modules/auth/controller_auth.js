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
const response_1 = require("../../utils/response");
const config_1 = require("../../config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const firebase_auth_1 = require("./firebase_auth");
const db_1 = require("../../db");
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
                res.status(201).json((0, response_1.successResponse)({
                    user: { id: user.id, email: user.email, full_name: user.full_name },
                    tokens,
                }, 'Registration successful'));
            }
            catch (error) {
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
                res.json((0, response_1.successResponse)(user, 'Profile updated'));
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.logout = async (req, res) => {
            try {
                await authService.logoutUser(req.user.id);
                res.json((0, response_1.successResponse)(null, 'Logged out successfully'));
            }
            catch (error) {
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
                res.json((0, response_1.successResponse)(null, 'Password changed successfully'));
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        /* AUTH-009: Google OAuth login */
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
                    console.warn('[DEV MODE] Firebase verification disabled');
                    if (!email) {
                        throw new Error('Email is required when Firebase verification is disabled');
                    }
                    firebaseUid = `dev-${email.toLowerCase()}`;
                }
                // Step 1: find by firebase_uid
                let user = await db_1.prisma.user.findUnique({
                    where: { firebase_uid: firebaseUid },
                    include: {
                        UserRole: {
                            include: { role: true },
                        },
                    },
                });
                // Step 2: not found, find by email
                if (!user && email) {
                    user = await db_1.prisma.user.findUnique({
                        where: { email },
                        include: {
                            UserRole: {
                                include: { role: true },
                            },
                        },
                    });
                    // Existing email account
                    if (user) {
                        // Already linked to another Google account?
                        if (user.firebase_uid && user.firebase_uid !== firebaseUid) {
                            throw new Error('Google account already linked');
                        }
                        // Link Google account
                        user = await db_1.prisma.user.update({
                            where: { id: user.id },
                            data: { firebase_uid: firebaseUid },
                            include: {
                                UserRole: {
                                    include: { role: true },
                                },
                            },
                        });
                    }
                }
                // Step 3: create new user
                if (!user) {
                    isNewUser = true;
                    user = await db_1.prisma.user.create({
                        data: {
                            firebase_uid: firebaseUid,
                            email,
                            full_name: displayName || '',
                            passwordHash: null,
                            UserRole: {
                                create: {
                                    role: {
                                        connect: {
                                            name: 'Tenant',
                                        },
                                    },
                                },
                            },
                        },
                        include: {
                            UserRole: {
                                include: { role: true },
                            },
                        },
                    });
                }
                if (!user.is_active)
                    throw new Error('Account is suspended');
                const tokens = authService.generateTokens(user.id);
                await authService.saveRefreshToken(user.id, tokens.refreshToken);
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
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
    }
}
exports.AuthController = AuthController;
