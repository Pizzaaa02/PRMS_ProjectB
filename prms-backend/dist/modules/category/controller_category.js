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
exports.CategoryController = void 0;
const categoryService = __importStar(require("./service_category"));
const response_1 = require("../../utils/response");
class CategoryController {
    constructor() {
        this.list = async (req, res) => {
            try {
                const { isShared, isDisabled, ownerId } = req.query;
                const categories = await categoryService.listCategories({
                    isShared: isShared ? isShared === 'true' : undefined,
                    isDisabled: isDisabled ? isDisabled === 'true' : undefined,
                    ownerId: ownerId,
                });
                res.json((0, response_1.successResponse)(categories));
            }
            catch (error) {
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.shared = async (req, res) => {
            try {
                const categories = await categoryService.getSharedCategories();
                res.json((0, response_1.successResponse)(categories));
            }
            catch (error) {
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.getById = async (req, res) => {
            try {
                const category = await categoryService.getCategoryById(String(req.params.id));
                if (!category) {
                    return res.status(404).json({ success: false, error: { message: 'Category not found' } });
                }
                res.json((0, response_1.successResponse)(category));
            }
            catch (error) {
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.create = async (req, res) => {
            try {
                const { name, description, isShared } = req.body;
                if (!req.user)
                    return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
                const category = await categoryService.createCategory({ name, description, isShared }, req.user.id);
                res.status(201).json((0, response_1.successResponse)(category, 'Category created'));
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.update = async (req, res) => {
            try {
                const { name, description, isShared, isDisabled } = req.body;
                const category = await categoryService.updateCategory(String(req.params.id), {
                    name,
                    description,
                    isShared,
                    isDisabled,
                });
                res.json((0, response_1.successResponse)(category, 'Category updated'));
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.remove = async (req, res) => {
            try {
                await categoryService.deleteCategory(String(req.params.id));
                res.json((0, response_1.successResponse)(null, 'Category deleted'));
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.toggle = async (req, res) => {
            try {
                const category = await categoryService.toggleCategoryDisabled(String(req.params.id));
                res.json((0, response_1.successResponse)(category, 'Category toggled'));
            }
            catch (error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.seedDefaults = async (req, res) => {
            try {
                if (!req.user)
                    return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
                const created = await categoryService.seedDefaultCategories(req.user.id);
                res.json((0, response_1.successResponse)({ count: created.length }, 'Default categories seeded'));
            }
            catch (error) {
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
    }
}
exports.CategoryController = CategoryController;
