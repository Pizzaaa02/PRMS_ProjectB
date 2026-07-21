"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeService = void 0;
const db_1 = require("../../db");
class ThemeService {
    async getPublishedTheme() {
        return db_1.prisma.theme.findFirst({
            where: { isPublished: true },
            include: { versions: { orderBy: { version: 'desc' }, take: 1 } },
        });
    }
    async getDraft(themeId) {
        return db_1.prisma.themeDraft.findFirst({ where: { themeId } });
    }
    async saveDraft(themeId, lightConfig, darkConfig) {
        let draft = await db_1.prisma.themeDraft.findFirst({ where: { themeId } });
        if (draft) {
            return db_1.prisma.themeDraft.update({
                where: { id: draft.id },
                data: { lightConfig, darkConfig },
            });
        }
        return db_1.prisma.themeDraft.create({
            data: { themeId, lightConfig, darkConfig },
        });
    }
    async publishDraft(themeId) {
        const theme = await db_1.prisma.theme.findUnique({ where: { id: themeId } });
        if (!theme)
            throw new Error('Theme not found');
        const draft = await db_1.prisma.themeDraft.findFirst({ where: { themeId } });
        if (!draft)
            throw new Error('No draft found');
        const maxVersion = await db_1.prisma.themeVersion.findFirst({
            where: { themeId },
            orderBy: { version: 'desc' },
        });
        return db_1.prisma.themeVersion.create({
            data: {
                themeId,
                version: (maxVersion?.version || 0) + 1,
                lightConfig: draft.lightConfig,
                darkConfig: draft.darkConfig,
            },
        });
    }
    async getVersions(themeId) {
        return db_1.prisma.themeVersion.findMany({
            where: { themeId },
            orderBy: { version: 'desc' },
        });
    }
    async restoreVersion(themeId, version) {
        const versionRecord = await db_1.prisma.themeVersion.findFirst({
            where: { themeId, version },
        });
        if (!versionRecord)
            throw new Error('Version not found');
        let draft = await db_1.prisma.themeDraft.findFirst({ where: { themeId } });
        if (draft) {
            return db_1.prisma.themeDraft.update({
                where: { id: draft.id },
                data: {
                    lightConfig: versionRecord.lightConfig,
                    darkConfig: versionRecord.darkConfig,
                },
            });
        }
        return db_1.prisma.themeDraft.create({
            data: {
                themeId,
                lightConfig: versionRecord.lightConfig,
                darkConfig: versionRecord.darkConfig,
            },
        });
    }
}
exports.ThemeService = ThemeService;
