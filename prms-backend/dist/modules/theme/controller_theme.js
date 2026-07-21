"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeController = void 0;
const service_theme_1 = require("./service_theme");
class ThemeController {
    constructor() {
        this.service = new service_theme_1.ThemeService();
    }
    async getTheme(req, res) {
        const theme = await this.service.getPublishedTheme();
        res.json({ success: true, data: theme });
    }
    async getDraft(req, res) {
        const draft = await this.service.getDraft(String(req.params.themeId));
        res.json({ success: true, data: draft });
    }
    async saveDraft(req, res) {
        const { themeId, lightConfig, darkConfig } = req.body;
        const draft = await this.service.saveDraft(themeId, lightConfig, darkConfig);
        res.json({ success: true, data: draft });
    }
    async publishDraft(req, res) {
        const version = await this.service.publishDraft(String(req.params.themeId));
        res.json({ success: true, data: version });
    }
    async getVersions(req, res) {
        const versions = await this.service.getVersions(String(req.params.themeId));
        res.json({ success: true, data: versions });
    }
    async restoreVersion(req, res) {
        const version = parseInt(req.params.version);
        const draft = await this.service.restoreVersion(String(req.params.themeId), version);
        res.json({ success: true, data: draft });
    }
}
exports.ThemeController = ThemeController;
