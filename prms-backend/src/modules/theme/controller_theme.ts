import { Request, Response } from 'express';
import { ThemeService } from './service_theme';

export class ThemeController {
  private service = new ThemeService();

  async getTheme(req: Request, res: Response) {
    const theme = await this.service.getPublishedTheme();
    res.json({ success: true, data: theme });
  }

  async getDraft(req: Request, res: Response) {
    const draft = await this.service.getDraft(String(req.params.themeId));
    res.json({ success: true, data: draft });
  }

  async saveDraft(req: Request, res: Response) {
    const { themeId, lightConfig, darkConfig } = req.body;
    const draft = await this.service.saveDraft(themeId, lightConfig, darkConfig);
    res.json({ success: true, data: draft });
  }

  async publishDraft(req: Request, res: Response) {
    const version = await this.service.publishDraft(String(req.params.themeId));
    res.json({ success: true, data: version });
  }

  async getVersions(req: Request, res: Response) {
    const versions = await this.service.getVersions(String(req.params.themeId));
    res.json({ success: true, data: versions });
  }

  async restoreVersion(req: Request, res: Response) {
    const version = parseInt(req.params.version as string);
    const draft = await this.service.restoreVersion(String(req.params.themeId), version);
    res.json({ success: true, data: draft });
  }
}
