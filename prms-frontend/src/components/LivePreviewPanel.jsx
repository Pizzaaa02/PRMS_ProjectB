/* LivePreviewPanel — tiny live preview of current settings
   Used in Customize page.
*/
import { useSettings } from '../contexts/SettingsContext';

export default function LivePreviewPanel() {
  const { settings } = useSettings();

  const mapSettings = (items) => {
    if (!items) return {};
    if (Array.isArray(items)) {
      const out = {};
      items.forEach((s) => { out[s.key] = s?.value ?? ''; });
      return out;
    }
    return items;
  };

  const s = mapSettings(settings);
  const primary = s.branding_primary_color || '#8a2be2';

  return (
    <div
      className="wc-preview"
      style={{ backgroundColor: s.branding_background_color || '#f3f6fb' }}
    >
      {/* Header */}
      <div
        className="wc-preview-header"
        style={{ background: s.header_background_color, color: s.header_text_color }}
      >
        {s.header_show_logo === 'true' && s.branding_logo_url && (
          <img src={s.branding_logo_url} alt="Logo" className="wc-preview-logo" />
        )}
        <span className="wc-preview-brand">{s.branding_site_name || 'PRMS'}</span>
      </div>

      {/* Hero */}
      <div className="wc-preview-hero" style={{ textAlign: s.home_hero_text_alignment || 'center' }}>
        <h3 style={{ color: s.branding_text_color }}>{s.home_hero_title}</h3>
        <p style={{ color: s.branding_text_color, opacity: 0.8 }}>
          {s.home_hero_subtitle}
        </p>
        <button className="wc-preview-cta" style={{ background: primary }}>
          {s.home_hero_cta || 'Get Started'}
        </button>
      </div>

      {/* Footer */}
      <div
        className="wc-preview-footer"
        style={{ background: s.advanced_footer_bg, color: s.advanced_footer_color }}
      >
        {s.advanced_footer_text || '© PRMS. All rights reserved.'}
      </div>
    </div>
  );
}
