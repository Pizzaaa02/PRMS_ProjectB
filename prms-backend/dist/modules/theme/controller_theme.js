"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeController = void 0;
const service_theme_1 = require("./service_theme");
const response_1 = require("../../utils/response");
const service_audit_1 = require("../admin/service_audit");
const HELPERS = (req) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    const ua = req.headers['user-agent'];
    const url = req.originalUrl;
    const method = req.method;
    const auth = req;
    const log = async (ctx) => {
        await (0, service_audit_1.recordAudit)({ ...ctx, userId: auth.user?.id, username: auth.user?.email || undefined, userRole: auth.user?.role, ipAddress: ip, userAgent: ua, requestUrl: url, httpMethod: method, module: 'Theme', status: ctx.status || 'Success', level: ctx.level || 'info' });
    };
    return { log };
};
class ThemeController {
    constructor() {
        this.service = new service_theme_1.ThemeService();
        this.getTheme = async (req, res) => {
            try {
                const theme = await this.service.getPublishedTheme();
                HELPERS(req).log({ action: 'VIEW_THEME', entity: 'Theme', description: 'Viewed published theme' });
                res.json((0, response_1.successResponse)(theme));
            }
            catch (error) {
                HELPERS(req).log({ action: 'VIEW_THEME', entity: 'Theme', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.getDraft = async (req, res) => {
            try {
                const draft = await this.service.getDraft(String(req.params.themeId));
                HELPERS(req).log({ action: 'VIEW_THEME_DRAFT', entity: 'Theme', entityId: req.params.id, description: 'Viewed theme draft' });
                res.json((0, response_1.successResponse)(draft));
            }
            catch (error) {
                HELPERS(req).log({ action: 'VIEW_THEME_DRAFT', entity: 'Theme', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.saveDraft = async (req, res) => {
            try {
                await this.service.saveDraft(String(req.params.themeId), req.body.lightConfig, req.body.darkConfig);
                HELPERS(req).log({ action: 'SAVE_THEME_DRAFT', entity: 'Theme', entityId: req.params.id, description: 'Saved theme draft' });
                res.json((0, response_1.successResponse)(null, 'Draft saved'));
            }
            catch (error) {
                HELPERS(req).log({ action: 'SAVE_THEME_DRAFT', entity: 'Theme', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.publishDraft = async (req, res) => {
            try {
                await this.service.publishDraft(String(req.params.themeId));
                HELPERS(req).log({ action: 'PUBLISH_THEME', entity: 'Theme', entityId: req.params.id, description: 'Published theme configuration' });
                res.json((0, response_1.successResponse)(null, 'Theme published'));
            }
            catch (error) {
                HELPERS(req).log({ action: 'PUBLISH_THEME', entity: 'Theme', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
        this.getVersions = async (req, res) => {
            try {
                const versions = await this.service.getVersions(String(req.params.themeId));
                HELPERS(req).log({ action: 'VIEW_THEME_VERSIONS', entity: 'Theme', description: 'Viewed theme version history' });
                res.json((0, response_1.successResponse)(versions));
            }
            catch (error) {
                HELPERS(req).log({ action: 'VIEW_THEME_VERSIONS', entity: 'Theme', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(500).json({ success: false, error: { message: error.message } });
            }
        };
        this.restoreVersion = async (req, res) => {
            try {
                await this.service.restoreVersion(String(req.params.themeId), parseInt(req.body.version));
                HELPERS(req).log({ action: 'RESTORE_THEME_VERSION', entity: 'Theme', entityId: req.params.id, description: 'Restored theme version' });
                res.json((0, response_1.successResponse)(null, 'Version restored'));
            }
            catch (error) {
                HELPERS(req).log({ action: 'RESTORE_THEME_VERSION', entity: 'Theme', status: 'Failed', level: 'error', errorMessage: error.message });
                res.status(400).json({ success: false, error: { message: error.message } });
            }
        };
    }
}
exports.ThemeController = ThemeController;
