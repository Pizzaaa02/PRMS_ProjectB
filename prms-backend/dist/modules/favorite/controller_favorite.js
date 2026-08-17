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
exports.favoriteController = exports.FavoriteController = void 0;
const favoriteService = __importStar(require("./service_favorite"));
const response_1 = require("../../utils/response");
class FavoriteController {
    constructor() {
        this.getMyFavorites = async (req, res) => {
            try {
                const userId = req.user?.id;
                const data = await favoriteService.getMyFavorites(userId);
                res.json((0, response_1.successResponse)(data));
            }
            catch (error) {
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.checkFavorite = async (req, res) => {
            try {
                const userId = req.user?.id;
                const propertyId = String(req.params.propertyId);
                const data = await favoriteService.checkFavorite(userId, propertyId);
                res.json((0, response_1.successResponse)(data));
            }
            catch (error) {
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.addFavorite = async (req, res) => {
            try {
                const userId = req.user?.id;
                const propertyId = String(req.params.propertyId);
                const data = await favoriteService.addFavorite(userId, propertyId);
                res.json((0, response_1.successResponse)(data, 'Favorite added'));
            }
            catch (error) {
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.removeFavorite = async (req, res) => {
            try {
                const userId = req.user?.id;
                const propertyId = String(req.params.propertyId);
                await favoriteService.removeFavorite(userId, propertyId);
                res.json((0, response_1.successResponse)(null, 'Favorite removed'));
            }
            catch (error) {
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
    }
}
exports.FavoriteController = FavoriteController;
exports.favoriteController = new FavoriteController();
