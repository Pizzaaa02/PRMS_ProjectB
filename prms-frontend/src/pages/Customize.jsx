import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Palette, Type as TypeIcon, Layout, Image as ImageIcon,
  MessageSquare, Settings, Check, X, Sun, Moon,
  Undo, Redo, RotateCcw, Save, Share2, Wand2,
  ChevronDown, ChevronUp, Edit3, Eye, EyeOff,
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useCustomization } from '../contexts/CustomizationContext';
import { adminApi } from '../api/admin';
import CustomizationPanel from '../components/CustomizationPanel';
import SettingField from '../components/SettingField';
import LivePreviewPanel from '../components/LivePreviewPanel';
import ElementInspector from '../components/ElementInspector';
import VersionHistory from '../components/VersionHistory';
import ThemeTemplates from '../components/ThemeTemplates';
import './Customize.css';

/* ============================================================
   Tab definitions — categories of settings with their fields
   Keys MUST match seed_settings.ts exactly
   ============================================================ */
const CATEGORIES = [
  {
    id: 'branding', icon: Palette, label: 'Branding',
    fields: [
      { key: 'branding_site_name', label: 'Site Name', type: 'text' },
      { key: 'branding_company_name', label: 'Company Name', type: 'text' },
      { key: 'branding_logo_url', label: 'Logo URL', type: 'text' },
      { key: 'branding_logo_upload', label: 'Upload Logo', type: 'file' },
      { key: 'theme_primary_color', label: 'Primary Color', type: 'color' },
      { key: 'theme_secondary_color', label: 'Secondary Color', type: 'color' },
      { key: 'theme_accent_color', label: 'Accent Color', type: 'color' },
      { key: 'theme_gradient_enabled', label: 'Use Gradient for Hero', type: 'toggle', help: 'Apply a gradient using primary + secondary colors' },
      { key: 'theme_gradient_direction', label: 'Gradient Direction', type: 'select', options: ['to right', 'to bottom', '135deg', '45deg', '90deg'] },
      { key: 'theme_shadow_enabled', label: 'Enable Shadows', type: 'toggle', help: 'Apply subtle shadows to cards and containers' },
      { key: 'theme_shadow_size', label: 'Shadow Depth', type: 'select', options: [
        { label: 'None', value: 'none' },
        { label: 'Small', value: 'sm' },
        { label: 'Default', value: 'md' },
        { label: 'Large', value: 'lg' },
        { label: 'XLarge', value: 'xl' },
      ] },
      { key: 'theme_animation_enabled', label: 'Enable Animations', type: 'toggle', help: 'Enable page transitions and animations' },
      { key: 'branding_favicon_url', label: 'Favicon URL', type: 'text' },
      { key: 'branding_footer_text', label: 'Footer Text', type: 'text' },
    ],
  },
  {
    id: 'typography', icon: TypeIcon, label: 'Typography',
    fields: [
      { key: 'theme_font_family', label: 'Font Family', type: 'select', options: [
        { label: 'Inter', value: 'Inter, Arial, sans-serif' },
        { label: 'Open Sans', value: 'Open Sans, Arial, sans-serif' },
        { label: 'Roboto', value: 'Roboto, Arial, sans-serif' },
        { label: 'Poppins', value: 'Poppins, Arial, sans-serif' },
        { label: 'Lato', value: 'Lato, Arial, sans-serif' },
        { label: 'Montserrat', value: 'Montserrat, Arial, sans-serif' },
        { label: 'Raleway', value: 'Raleway, Arial, sans-serif' },
        { label: 'Noto Sans', value: 'Noto Sans, Arial, sans-serif' },
      ] },
      { key: 'theme_font_weight', label: 'Font Weight', type: 'select', options: [
        { label: 'Light (300)', value: '300' },
        { label: 'Regular (400)', value: '400' },
        { label: 'Medium (500)', value: '500' },
        { label: 'Semi Bold (600)', value: '600' },
        { label: 'Bold (700)', value: '700' },
      ] },
      { key: 'theme_letter_spacing', label: 'Letter Spacing', type: 'select', options: [
        { label: 'Tighter (-0.05em)', value: '-0.05em' },
        { label: 'Tight (-0.025em)', value: '-0.025em' },
        { label: 'Normal (0)', value: '0' },
        { label: 'Wide (0.025em)', value: '0.025em' },
        { label: 'Wider (0.05em)', value: '0.05em' },
        { label: 'Widest (0.1em)', value: '0.1em' },
      ] },
      { key: 'theme_font_size_base', label: 'Base Font Size', type: 'select', options: [
        { label: 'Small (13px)', value: '13px' },
        { label: 'Default (14px)', value: '14px' },
        { label: 'Medium (15px)', value: '15px' },
        { label: 'Large (16px)', value: '16px' },
        { label: 'XL (18px)', value: '18px' },
      ] },
      { key: 'theme_line_height', label: 'Line Height', type: 'select', options: [
        { label: 'None (1)', value: '1' },
        { label: 'Tight (1.25)', value: '1.25' },
        { label: 'Snug (1.375)', value: '1.375' },
        { label: 'Normal (1.5)', value: '1.5' },
        { label: 'Relaxed (1.625)', value: '1.625' },
        { label: 'Loose (2)', value: '2' },
      ] },
      { key: 'theme_border_radius', label: 'Border Radius', type: 'select', options: [
        { label: 'None (0px)', value: '0px' },
        { label: 'Small (4px)', value: '4px' },
        { label: 'Medium (8px)', value: '8px' },
        { label: 'Default (10px)', value: '10px' },
        { label: 'Large (16px)', value: '16px' },
        { label: 'XL (24px)', value: '24px' },
      ] },
      { key: 'theme_dark_mode', label: 'Enable Dark Mode', type: 'toggle' },
    ],
  },
  {
    id: 'header', icon: Layout, label: 'Header',
    fields: [
      { key: 'header_background_color', label: 'Background Color', type: 'color' },
      { key: 'header_text_color', label: 'Text Color', type: 'color' },
      { key: 'header_alignment', label: 'Content Alignment', type: 'select', options: ['left', 'center', 'right'] },
      { key: 'header_show_logo', label: 'Show Logo', type: 'toggle' },
      { key: 'header_show_search', label: 'Show Search', type: 'toggle' },
      { key: 'header_show_notifications', label: 'Show Notifications', type: 'toggle' },
      { key: 'header_cta_button_text', label: 'CTA Button Text', type: 'text' },
      { key: 'header_cta_button_color', label: 'CTA Button Color', type: 'color' },
    ],
  },
  {
    id: 'footer', icon: MessageSquare, label: 'Footer',
    fields: [
      { key: 'footer_background_color', label: 'Background Color', type: 'color' },
      { key: 'footer_text_color', label: 'Text Color', type: 'color' },
      { key: 'footer_copyright_text', label: 'Copyright Text', type: 'text' },
      { key: 'footer_company_address', label: 'Company Address', type: 'text' },
      { key: 'footer_company_phone', label: 'Phone Number', type: 'tel' },
      { key: 'footer_company_email', label: 'Company Email', type: 'email' },
    ],
  },
  {
    id: 'home', icon: ImageIcon, label: 'Homepage',
    fields: [
      // Section visibility toggles
      { key: 'homepage_show_hero', label: 'Show Hero Section', type: 'toggle', help: 'Display the hero/banner section on the homepage' },
      { key: 'homepage_show_search_bar', label: 'Show Search Bar', type: 'toggle', help: 'Display the property search bar below the hero' },
      { key: 'homepage_show_featured', label: 'Show Featured Properties', type: 'toggle', help: 'Display the featured property listing grid' },
      { key: 'homepage_show_features', label: 'Show Features Section', type: 'toggle', help: 'Display the feature highlights section' },
      { key: 'homepage_show_testimonials', label: 'Show Testimonials', type: 'toggle', help: 'Display customer testimonials/reviews' },
      { key: 'homepage_show_cta', label: 'Show CTA Section', type: 'toggle', help: 'Display the call-to-action banner before the footer' },
      { key: 'homepage_show_about', label: 'Show About Section', type: 'toggle', help: 'Display the about us section' },
      // Hero content
      { key: 'homepage_hero_title', label: 'Hero Title', type: 'text' },
      { key: 'homepage_hero_subtitle', label: 'Hero Subtitle', type: 'textarea' },
      { key: 'homepage_hero_button_text', label: 'Hero CTA Text', type: 'text' },
      { key: 'homepage_hero_button_link', label: 'Hero CTA Link', type: 'text' },
      { key: 'homepage_hero_image', label: 'Hero Image URL', type: 'text' },
      { key: 'homepage_hero_text_alignment', label: 'Hero Text Alignment', type: 'select', options: ['left', 'center', 'right'] },
      { key: 'homepage_hero_background_color', label: 'Hero Background Color', type: 'color' },
      // About content
      { key: 'homepage_about_title', label: 'About Section Title', type: 'text' },
      { key: 'homepage_about_description', label: 'About Description', type: 'textarea' },
      { key: 'homepage_about_image', label: 'About Section Image URL', type: 'text' },
      { key: 'homepage_about_alignment', label: 'About Content Alignment', type: 'select', options: ['left', 'center', 'right'] },
    ],
  },
  {
    id: 'features', icon: Settings, label: 'Features',
    fields: [
      { key: 'feature_payments', label: 'Payments Module', type: 'toggle', help: 'Enable or disable payment functionality' },
      { key: 'feature_maintenance', label: 'Maintenance Requests', type: 'toggle', help: 'Enable or disable maintenance requests' },
      { key: 'feature_messaging', label: 'Messaging Module', type: 'toggle', help: 'Enable or disable messaging system' },
      { key: 'feature_notifications', label: 'Notifications', type: 'toggle', help: 'Enable or disable notifications' },
      { key: 'feature_analytics', label: 'Analytics Module', type: 'toggle', help: 'Enable or disable analytics tracking' },
      { key: 'feature_recommendations', label: 'Recommendations', type: 'toggle', help: 'Enable or disable property recommendations' },
      { key: 'feature_maps', label: 'Maps Integration', type: 'toggle', help: 'Enable or disable maps on listings' },
    ],
  },
];

/* ============================================================
   Customize — consolidated page
   ============================================================ */
export default function Customize() {
  const { settings: allSettings, updateSetting, bulkUpdateSettings, loadSettings } = useSettings();
  const { isEditMode, setIsEditMode } = useCustomization();

  const [activeTab, setActiveTab] = useState('branding');
  const [editingFields, setEditingFields] = useState({});
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('customizer-theme') || 'light';
  });
  const [showPreview, setShowPreview] = useState(true);
  const [editingElements, setEditingElements] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inspectorKey, setInspectorKey] = useState(null);
  const [themeId, setThemeId] = useState(null);
  const [currentVersion, setCurrentVersion] = useState(1);

  useEffect(() => {
    adminApi.getTheme().then(res => {
      const id = res?.data?.data?.id;
      setThemeId(id);
      setCurrentVersion(res?.data?.data?.version || 1);
    }).catch(() => {});
  }, []);

  const currentCat = CATEGORIES.find((c) => c.id === activeTab);

  /* ---- helpers ---- */

  const getSettingValue = useCallback(
    (key) => {
      return allSettings?.[key] ?? '';
    },
    [allSettings],
  );

  /* When user clicks an element in the preview, navigate to the right tab
     and scroll to the field. */
  const focusField = useCallback((key) => {
    /* Find which category contains this field */
    for (const cat of CATEGORIES) {
      const hasIt = cat.fields.some(f => f.key === key);
      if (hasIt) {
        setActiveTab(cat.id);
        setInspectorKey(key);
        setTimeout(() => {
          const el = document.getElementById(`field-${key}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.focus();
          }
        }, 150);
        return;
      }
    }
    setInspectorKey(key);
  }, []);

  /* Collect all edited fields as {key, value} for bulk update */
  const getDirtySettings = () => {
    return Object.entries(editingFields)
      .filter(([, v]) => v !== undefined && v !== null && v !== false)
      .map(([k, v]) => ({ key: k, value: String(v) }));
  };

  /* ---- edit mode ---- */

  const toggleFieldEdit = (key) => {
    setEditingFields((prev) => ({
      ...prev,
      [key]: prev[key] === undefined ? undefined : undefined,
    }));
  };

  /* ---- theme ---- */

  const applyThemeMode = (mode) => {
    setThemeMode(mode);
    localStorage.setItem('customizer-theme', mode);
    document.documentElement.setAttribute('data-theme', mode);
  };

  /* ---- actions ---- */

  const saveDraft = async () => {
    const dirty = getDirtySettings();
    if (dirty.length === 0) return;
    setLoading(true);
    try {
      await bulkUpdateSettings(dirty);
      setEditingFields({});
    } catch (err) {
      console.error('Save draft failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const restoreVersion = async (version) => {
    if (!themeId) return;
    if (!window.confirm(`Restore to version ${version}? A draft will be created so you can review it before publishing.`)) return;
    setLoading(true);
    try {
      await adminApi.restoreVersion(themeId, version);
      await loadSettings();
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  const publishTheme = async () => {
    setLoading(true);
    try {
      /* First commit any dirty fields */
      const dirty = getDirtySettings();
      if (dirty.length > 0) {
        await bulkUpdateSettings(dirty);
      }
      /* Then publish the current theme */
      const themeResp = await adminApi.getTheme();
      const themeId = themeResp?.data?.data?.id;
      if (themeId) {
        await adminApi.publishTheme(themeId);
      }
      setEditingFields({});
    } catch (err) {
      console.error('Publish failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const factoryReset = async () => {
    if (!window.confirm('Factory Reset: Reload all settings to defaults. Continue?')) return;
    try {
      await loadSettings();
      setEditingFields({});
    } catch { /* ignore */ }
  };

  const discard = () => {
    setEditingFields({});
  };

  /* ---- Preset templates ---- */

  const applyPreset = (preset) => {
    const vals = {};
    Object.entries(preset.settings).forEach(([k, v]) => {
      vals[k] = v;
    });
    setEditingFields((prev) => ({ ...prev, ...vals }));
    window.alert(`Preset "${preset.name}" applied. Click "Save Draft" to persist.`);
  };

  const exportSettings = () => {
    const data = {};
    Object.keys(editingFields).forEach((k) => {
      if (editingFields[k] !== undefined) data[k] = editingFields[k];
    });
    /* Also include published values as fallback */
    Object.keys(allSettings || {}).forEach((k) => {
      if (!data[k]) data[k] = allSettings[k];
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prms-theme.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (data) => {
    if (!data || typeof data !== 'object') {
      window.alert('Invalid data.');
      return;
    }
    if (!window.confirm('Import will overwrite current settings. Continue?')) return;
    const vals = {};
    Object.entries(data).forEach(([k, v]) => {
      vals[k] = v;
    });
    setEditingFields((prev) => ({ ...prev, ...vals }));
    window.alert(`Imported ${Object.keys(data).length} settings. Click "Save Draft" to persist.`);
  };

  /* Count of dirty fields for UI badge */
  const dirtyCount = Object.keys(editingFields).filter(
    (k) => editingFields[k] !== undefined
  ).length;

  return (
    <motion.div
      className="wc-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <header className="wc-header">
        <div>
          <h1 className="wc-title">Customize Website</h1>
          <p className="wc-subtitle">
            Style colors, typography, layout, header, footer, homepage content, and feature toggles.
            {dirtyCount > 0 && (
              <span className="wc-dirty-badge" style={{ marginLeft: 8, color: '#dc2626', fontWeight: 600 }}>
                {dirtyCount} change{dirtyCount !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>

        <div className="wc-header-controls">
          {/* Theme mode toggle */}
          <div className="wc-theme-toggle">
            {[
              { id: 'light', icon: Sun, label: 'Light' },
              { id: 'dark', icon: Moon, label: 'Dark' },
            ].map((opt) => (
              <motion.button
                key={opt.id}
                type="button"
                className={`wc-theme-btn ${themeMode === opt.id ? 'wc-theme-btn-active' : ''}`}
                onClick={() => applyThemeMode(opt.id)}
                whileTap={{ scale: 0.95 }}
              >
                <opt.icon size={14} />
                <span>{opt.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Edit-mode toggle */}
          <motion.button
            type="button"
            className={`wc-edit-toggle-btn ${editingElements ? 'wc-edit-toggle-on' : ''}`}
            onClick={() => setEditingElements((v) => !v)}
            whileTap={{ scale: 0.96 }}
          >
            {editingElements ? <EyeOff size={14} /> : <Eye size={14} />}
            <span>{editingElements ? 'Exit Edit' : 'Edit Elements'}</span>
          </motion.button>

          {/* Reset */}
          <motion.button
            type="button"
            className="wc-reset-btn"
            onClick={discard}
            whileTap={{ scale: 0.96 }}
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </motion.button>

          {/* Factory Reset */}
          <motion.button
            type="button"
            className="wc-reset-btn factory-reset"
            onClick={factoryReset}
            whileTap={{ scale: 0.96 }}
          >
            <Wand2 size={14} />
            <span>Factory Reset</span>
          </motion.button>
        </div>
      </header>

      {/* Body */}
      <div className="wc-body">
        {/* ---- Editor Panel ---- */}
        <div className="wc-editor-panel">
          {/* Tab bar */}
          <div className="wc-tab-bar">
            {CATEGORIES.map((cat) => {
              const catDirty = cat.fields.some(f => editingFields[f.key] !== undefined);
              return (
                <motion.button
                  key={cat.id}
                  type="button"
                  className={`wc-tab ${activeTab === cat.id ? 'wc-tab-active' : ''}`}
                  onClick={() => setActiveTab(cat.id)}
                  whileTap={{ scale: 0.96 }}
                >
                  <cat.icon size={16} />
                  <span>{cat.label}</span>
                  {catDirty && <span className="wc-tab-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#dc2626' }} />}
                </motion.button>
              );
            })}
          </div>

          {/* Current tab fields */}
          <div className="wc-tab-content">
            {currentCat?.fields.map((field) => {
              const isDirty = editingFields[field.key] !== undefined;
              const value = isDirty ? editingFields[field.key] : getSettingValue(field.key);

              return (
                <SettingField
                  key={field.key}
                  field={field}
                  value={value}
                  onChange={(v) => {
                    setEditingFields((prev) => ({
                      ...prev,
                      [field.key]: v,
                    }));
                  }}
                  isEditing={isDirty}
                  settingsRef={allSettings}
                  id={`field-${field.key}`}
                />
              );
            })}
          </div>

          {/* ---- Element-level editor (when Edit Elements is ON) ---- */}
          {editingElements && (
            <div style={{ padding: '20px 24px', borderTop: '1px solid #e5e7eb' }}>
              <CustomizationPanel />
            </div>
          )}

          {/* ---- Inspector panel (when a field is highlighted) ---- */}
          {inspectorKey && (
            <div style={{ padding: '0 24px 16px' }}>
              <ElementInspector
                onInspect={(key) => focusField(key)}
                onClose={() => setInspectorKey(null)}
              />
            </div>
          )}

          {/* Preset templates + export/import */}
          <ThemeTemplates
            onApply={applyPreset}
            onExport={exportSettings}
            onImport={importSettings}
          />
        </div>

        {/* ---- Preview Panel ---- */}
        {showPreview && (
          <div className="wc-preview-panel">
            <div className="wc-preview-sticky" onClick={() => focusField(inspectorKey)}>
              <LivePreviewPanel onElementClick={focusField} />
            </div>

            {/* Version history below the preview */}
            <VersionHistory
              themeId={themeId}
              currentVersion={currentVersion}
              onRestore={restoreVersion}
            />
          </div>
        )}
      </div>

      {/* Bottom toolbar */}
      <div className="wc-bottom-toolbar">
        <div className="wc-toolbar-group">
          <motion.button
            type="button"
            className="wc-toolbar-btn wc-toolbar-btn-discard"
            onClick={discard}
            whileTap={{ scale: 0.96 }}
          >
            <Undo size={14} />
            <span>Discard</span>
          </motion.button>

          <motion.button
            type="button"
            className="wc-toolbar-btn"
            onClick={() => setShowPreview((v) => !v)}
            whileTap={{ scale: 0.96 }}
          >
            {showPreview ? <EyeOff size={14} /> : <Eye size={14} /> }
            <span>{showPreview ? 'Hide' : 'Show'} Preview</span>
          </motion.button>
        </div>

        <div className="wc-toolbar-group">
          <motion.button
            type="button"
            className="wc-toolbar-btn wc-toolbar-btn-save"
            onClick={saveDraft}
            whileTap={{ scale: 0.96 }}
            disabled={loading || dirtyCount === 0}
          >
            <Save size={14} />
            <span>{loading ? 'Saving...' : 'Save Draft'}</span>
          </motion.button>

          <motion.button
            type="button"
            className="wc-toolbar-btn wc-toolbar-btn-publish"
            onClick={publishTheme}
            disabled={loading}
            whileTap={{ scale: 0.96 }}
          >
            <Share2 size={14} />
            <span>Publish</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
