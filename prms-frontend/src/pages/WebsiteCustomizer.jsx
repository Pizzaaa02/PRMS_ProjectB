import { useState, useCallback, useRef, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useCustomization } from '../contexts/CustomizationContext';
import CustomizationPanel from '../components/CustomizationPanel';
import useElementPicker from '../hooks/useElementPicker';
import {
  Palette, Building2, Type, LayoutTemplate,
  Palette as ThemeIcon, Globe, ToggleLeft, CheckCircle2,
  Save, RotateCcw, Sun, Moon, Pencil, PencilOff,
  Undo, Redo, Trash2
} from 'lucide-react';
import './WebsiteCustomizer.css';

/* ------------------------------------------------------------------ */
/*  Tab definitions                                                    */
/* ------------------------------------------------------------------ */

const TABS = [
  { id: 'theme',      label: 'Theme',       icon: Palette },
  { id: 'branding',   label: 'Branding',    icon: Building2 },
  { id: 'header',     label: 'Header',      icon: LayoutTemplate },
  { id: 'footer',     label: 'Footer',      icon: Type },
  { id: 'homepage',   label: 'Homepage',    icon: Globe },
  { id: 'features',   label: 'Features',    icon: ToggleLeft },
];

/* ------------------------------------------------------------------ */
/*  Field definitions per category                                     */
/* ------------------------------------------------------------------ */

const FIELDS = {
  theme: [
    { key: 'theme_primary_color',       label: 'Primary Colour',     type: 'color' },
    { key: 'theme_secondary_color',     label: 'Secondary Colour',   type: 'color' },
    { key: 'theme_accent_color',        label: 'Accent Colour',      type: 'color' },
    { key: 'theme_background_color',    label: 'Background Colour',  type: 'color' },
    { key: 'theme_text_color',          label: 'Text Colour',        type: 'color' },
    { key: 'theme_font_family',         label: 'Font Family',        type: 'select',
      options: [
        { value: 'Inter, Arial, sans-serif',        label: 'Inter (Default)' },
        { value: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', label: 'Segoe UI' },
        { value: 'Poppins, sans-serif',              label: 'Poppins' },
        { value: 'Roboto, sans-serif',               label: 'Roboto' },
        { value: 'Open Sans, sans-serif',            label: 'Open Sans' },
        { value: 'Lato, sans-serif',                 label: 'Lato' },
        { value: 'Montserrat, sans-serif',           label: 'Montserrat' },
        { value: 'Raleway, sans-serif',              label: 'Raleway' },
        { value: 'Nunito, sans-serif',               label: 'Nunito' },
        { value: "Courier New, Courier, monospace", label: 'Courier New' },
      ]},
    { key: 'theme_border_radius',    label: 'Border Radius',    type: 'select',
      options: [
        { value: '0px',     label: 'Sharp (0px)' },
        { value: '4px',     label: 'Small (4px)' },
        { value: '8px',     label: 'Medium (8px)' },
        { value: '10px',    label: 'Default (10px)' },
        { value: '12px',    label: 'Large (12px)' },
        { value: '16px',    label: 'X-Large (16px)' },
        { value: '999px',   label: 'Full Round (999px)' },
      ]},
  ],

  branding: [
    { key: 'branding_site_name',      label: 'Site Name',          type: 'text', placeholder: 'PRMS' },
    { key: 'branding_company_name',   label: 'Company Name',       type: 'text', placeholder: 'Your Company Sdn Bhd' },
    { key: 'branding_logo_url',       label: 'Logo Image URL',     type: 'text', placeholder: 'https://example.com/logo.png' },
    { key: 'branding_favicon_url',    label: 'Favicon URL',        type: 'text', placeholder: 'https://example.com/favicon.ico' },
    { key: 'branding_footer_text',    label: 'Footer Text',        type: 'text', placeholder: 'Text for the footer' },
    { key: 'branding_support_email',  label: 'Support Email',      type: 'email', placeholder: 'support@yourcompany.com' },
    { key: 'branding_support_phone',  label: 'Support Phone',      type: 'tel', placeholder: '+60 12-345 6789' },
  ],

  header: [
    { key: 'header_background_color',   label: 'Background Colour', type: 'color' },
    { key: 'header_text_color',         label: 'Text Colour',       type: 'color' },
    { key: 'header_alignment',          label: 'Alignment',         type: 'select',
      options: [
        { value: 'left',   label: 'Left' },
        { value: 'center', label: 'Centre' },
        { value: 'right',  label: 'Right' },
      ]},
    { key: 'header_show_logo',          label: 'Show Logo',         type: 'toggle' },
    { key: 'header_show_search',        label: 'Show Search Bar',   type: 'toggle' },
    { key: 'header_show_notifications', label: 'Show Notifications', type: 'toggle' },
    { key: 'header_cta_button_text',    label: 'CTA Button Text',   type: 'text', placeholder: 'Get Started' },
    { key: 'header_cta_button_color',   label: 'CTA Button Colour', type: 'color' },
  ],

  footer: [
    { key: 'footer_background_color', label: 'Background Colour',  type: 'color' },
    { key: 'footer_text_color',       label: 'Text Colour',        type: 'color' },
    { key: 'footer_company_address',  label: 'Company Address',    type: 'text', placeholder: 'No. 1, Jalan Utama, Kuala Lumpur' },
    { key: 'footer_company_phone',    label: 'Company Phone',      type: 'tel', placeholder: '+60 12-345 6789' },
    { key: 'footer_company_email',    label: 'Company Email',      type: 'email', placeholder: 'info@yourcompany.com' },
    { key: 'footer_copyright_text',   label: 'Copyright Text',     type: 'text', placeholder: '2026 Your Company. All rights reserved.' },
  ],

  homepage: [
    { key: 'homepage_hero_title',          label: 'Hero Title',            type: 'text', placeholder: 'Find Your Perfect Rental Property' },
    { key: 'homepage_hero_subtitle',       label: 'Hero Subtitle',         type: 'textarea', placeholder: 'Discover top-quality rental properties...' },
    { key: 'homepage_hero_image',          label: 'Hero Background Image', type: 'text', placeholder: 'https://example.com/hero.jpg' },
    { key: 'homepage_hero_button_text',    label: 'Hero Button Text',      type: 'text', placeholder: 'Browse Properties' },
    { key: 'homepage_hero_button_link',    label: 'Hero Button Link',      type: 'text', placeholder: '/properties' },
    { key: 'homepage_hero_text_alignment', label: 'Hero Text Alignment',   type: 'select',
      options: [
        { value: 'left',   label: 'Left' },
        { value: 'center', label: 'Centre' },
        { value: 'right',  label: 'Right' },
      ]},
    { key: 'homepage_hero_background_color', label: 'Hero Background Colour', type: 'color' },
    { key: 'homepage_about_title',       label: 'About Section Title',   type: 'text', placeholder: 'About Us' },
    { key: 'homepage_about_description', label: 'About Section Text',    type: 'textarea', placeholder: 'We are dedicated to...' },
    { key: 'homepage_about_image',       label: 'About Section Image',   type: 'text', placeholder: 'https://example.com/about.jpg' },
    { key: 'homepage_about_alignment',   label: 'About Alignment',       type: 'select',
      options: [
        { value: 'left',   label: 'Left' },
        { value: 'center', label: 'Centre' },
        { value: 'right',  label: 'Right' },
      ]},
  ],

  features: [
    { key: 'feature_payments',        label: 'Payments Module',        type: 'toggle', help: 'Allow property rental payments' },
    { key: 'feature_maintenance',     label: 'Maintenance Module',     type: 'toggle', help: 'Maintenance ticket requests' },
    { key: 'feature_messaging',       label: 'Messaging Module',       type: 'toggle', help: 'In-app messaging between users' },
    { key: 'feature_notifications',   label: 'Notifications Module',   type: 'toggle', help: 'Push and in-app notifications' },
    { key: 'feature_analytics',       label: 'Analytics Module',       type: 'toggle', help: 'Dashboard analytics and reports' },
    { key: 'feature_recommendations', label: 'Recommendations Module', type: 'toggle', help: 'AI-based property recommendations' },
    { key: 'feature_maps',            label: 'Maps Integration',       type: 'toggle', help: 'Interactive property location maps' },
  ],
};

/* ------------------------------------------------------------------ */
/*  Individual field renderer                                          */
/* ------------------------------------------------------------------ */

function SettingField({ field, value, onChange }) {
  switch (field.type) {
    case 'color':
      return (
        <div className="wc-field wc-color-field">
          <label className="wc-label">{field.label}</label>
          <div className="wc-color-inputs">
            <input
              type="color"
              value={value || '#000000'}
              onChange={e => onChange(field.key, e.target.value)}
            />
            <input
              type="text"
              className="wc-hex"
              value={value || ''}
              onChange={e => onChange(field.key, e.target.value)}
              placeholder="#8a2be2"
            />
            <div
              className="wc-color-swatch"
              style={{ background: value || 'transparent' }}
              title={value || 'Not set'}
            />
          </div>
        </div>
      );

    case 'toggle':
      return (
        <div className="wc-field wc-toggle-field">
          <label className="wc-label">{field.label}</label>
          <button
            type="button"
            className={`wc-toggle-btn ${String(value) === 'true' ? 'wc-toggle-on' : 'wc-toggle-off'}`}
            onClick={() => onChange(field.key, String(value) === 'true' ? 'false' : 'true')}
          >
            {String(value) === 'true' ? 'ON' : 'OFF'}
          </button>
          <span className="wc-help-text">{field.help || ''}</span>
        </div>
      );

    case 'select':
      return (
        <div className="wc-field">
          <label className="wc-label">{field.label}</label>
          <select
            value={value || ''}
            onChange={e => onChange(field.key, e.target.value)}
            className="wc-select"
          >
            {field.options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      );

    case 'textarea':
      return (
        <div className="wc-field">
          <label className="wc-label">{field.label}</label>
          <textarea
            className="wc-textarea"
            rows={3}
            value={value || ''}
            onChange={e => onChange(field.key, e.target.value)}
            placeholder={field.placeholder}
          />
        </div>
      );

    default:
      return (
        <div className="wc-field">
          <label className="wc-label">{field.label}</label>
          <input
            type={field.type || 'text'}
            className="wc-input"
            value={value || ''}
            onChange={e => onChange(field.key, e.target.value)}
            placeholder={field.placeholder}
          />
          {field.help && <span className="wc-help-text">{field.help}</span>}
        </div>
      );
  }
}

/* ------------------------------------------------------------------ */
/*  Live preview mini-panel                                            */
/* ------------------------------------------------------------------ */

function LivePreviewPanel({ settings }) {
  const primary = settings.theme_primary_color || '#8a2be2';
  return (
    <div className="wc-preview" style={{ backgroundColor: settings.theme_background_color || '#f3f6fb' }}>
      <div className="wc-preview-header" style={{ background: settings.header_background_color, color: settings.header_text_color }}>
        {settings.header_show_logo === 'true' && (settings.branding_logo_url ?? '').trim() && (
          <img
            src={settings.branding_logo_url}
            alt="Logo preview"
            className="wc-preview-logo"
          />
        )}
        <span className="wc-preview-brand">{settings.branding_site_name || 'PRMS'}</span>
      </div>

      <div className="wc-preview-hero" style={{ textAlign: settings.homepage_hero_text_alignment }}>
        <h3 style={{ color: settings.theme_text_color }}>{settings.homepage_hero_title}</h3>
        <p style={{ color: settings.theme_text_color, opacity: 0.8 }}>
          {settings.homepage_hero_subtitle}
        </p>
        <button className="wc-preview-cta" style={{ background: primary }}>
          {settings.homepage_hero_button_text}
        </button>
      </div>

      <div className="wc-preview-footer" style={{ background: settings.footer_background_color, color: settings.footer_text_color }}>
        {settings.footer_copyright_text}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Bottom toolbar (undo / redo / reset / save / publish / discard)   */
/* ------------------------------------------------------------------ */

function BottomToolbar() {
  const {
    undo, redo, historyPast, historyFuture,
    resetElement, discardChanges,
    saveDraft, publish, saving, publishing,
    factoryReset,
  } = useCustomization();

  return (
    <div className="wc-bottom-toolbar">
      <div className="wc-toolbar-group">
        <button
          type="button"
          className="wc-toolbar-btn"
          disabled={historyPast.length === 0}
          onClick={undo}
          title="Undo"
        >
          <Undo size={16} />
          <span>Undo</span>
        </button>

        <button
          type="button"
          className="wc-toolbar-btn"
          disabled={historyFuture.length === 0}
          onClick={redo}
          title="Redo"
        >
          <Redo size={16} />
          <span>Redo</span>
        </button>

        <button
          type="button"
          className="wc-toolbar-btn"
          onClick={resetElement}
          title="Reset selected element"
        >
          <RotateCcw size={16} />
          <span>Reset Element</span>
        </button>

        <button
          type="button"
          className="wc-toolbar-btn wc-toolbar-btn-discard"
          onClick={discardChanges}
          title="Discard all unsaved changes"
        >
          <Trash2 size={16} />
          <span>Discard Changes</span>
        </button>
      </div>

      <div className="wc-toolbar-group">
        <button
          type="button"
          className="wc-toolbar-btn wc-toolbar-btn-save"
          disabled={saving}
          onClick={() => saveDraft('default')}
          title="Save draft"
        >
          <Save size={16} />
          <span>{saving ? 'Saving…' : 'Save Draft'}</span>
        </button>

        <button
          type="button"
          className="wc-toolbar-btn wc-toolbar-btn-publish"
          disabled={publishing}
          onClick={() => publish('default')}
          title="Publish theme"
        >
          <CheckCircle2 size={16} />
          <span>{publishing ? 'Publishing…' : 'Publish'}</span>
        </button>

        <button
          type="button"
          className="wc-toolbar-btn factory-reset"
          onClick={factoryReset}
          title="Factory Reset"
        >
          <RotateCcw size={16} />
          <span>Factory Reset</span>
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main customizer page                                               */
/* ------------------------------------------------------------------ */

function WebsiteCustomizer() {
  const { settings, updateSetting, loadSettings } = useSettings();
  const {
    isEditMode, setIsEditMode,
    editingTheme, setEditingTheme,
  } = useCustomization();

  const [activeTab, setActiveTab] = useState('theme');

  /* Activate element picker when edit mode is on */
  useElementPicker();

  const handleChange = useCallback(async (key, value) => {
    await updateSetting(key, value);
  }, [updateSetting]);

  const handleReset = useCallback(async () => {
    await loadSettings('public');
  }, [loadSettings]);

  /* Toggle edit mode and theme together */
  const toggleEditMode = useCallback(() => {
    setIsEditMode(prev => !prev);
  }, [setIsEditMode]);

  return (
    <div className="wc-page">
      {/* Header */}
      <div className="wc-header">
        <div>
          <h1 className="wc-title">Website Customizer</h1>
          <p className="wc-subtitle">
            {isEditMode
              ? 'Click any highlighted element to edit its styles.'
              : 'Customise the look and feel of your PRMS website in real-time. Changes apply instantly.'}
          </p>
        </div>

        {isEditMode ? (
          <div className="wc-header-controls">
            {/* Theme mode selector */}
            <div className="wc-theme-toggle">
              <button
                type="button"
                className={`wc-theme-btn ${editingTheme === 'light' ? 'wc-theme-btn-active' : ''}`}
                onClick={() => setEditingTheme('light')}
                title="Edit Light theme"
              >
                <Sun size={16} />
                <span>Light</span>
              </button>
              <button
                type="button"
                className={`wc-theme-btn ${editingTheme === 'dark' ? 'wc-theme-btn-active' : ''}`}
                onClick={() => setEditingTheme('dark')}
                title="Edit Dark theme"
              >
                <Moon size={16} />
                <span>Dark</span>
              </button>
            </div>

            {/* Edit mode toggle */}
            <button
              type="button"
              className="wc-edit-toggle-btn"
              onClick={toggleEditMode}
            >
              <PencilOff size={16} />
              <span>Exit Edit Mode</span>
            </button>
          </div>
        ) : (
          <div className="wc-header-controls">
            <button
              type="button"
              className="wc-reset-btn"
              onClick={handleReset}
            >
              <RotateCcw size={16} />
              <span>Reset to Server</span>
            </button>

            <button
              type="button"
              className="wc-edit-toggle-btn wc-edit-toggle-on"
              onClick={toggleEditMode}
            >
              <Pencil size={16} />
              <span>Edit Mode</span>
            </button>
          </div>
        )}
      </div>

      {isEditMode ? (
        /* ---- EDIT MODE LAYOUT ---- */
        <div className="wc-edit-body">
          {/* Left: Preview area */}
          <div className="wc-edit-preview">
            <div className="wc-preview-sticky">
              <LivePreviewPanel settings={settings} />
            </div>
          </div>

          {/* Right: Customization Panel */}
          <CustomizationPanel />

          {/* Bottom: Toolbar */}
          <BottomToolbar />
        </div>
      ) : (
        /* ---- CLASSIC TAB LAYOUT ---- */
        <div className="wc-body">
          {/* Left: Editor Panel */}
          <div className="wc-editor-panel">
            {/* Tab bar */}
            <div className="wc-tab-bar">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    className={`wc-tab ${isActive ? 'wc-tab-active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <div className="wc-tab-content">
              {FIELDS[activeTab] && FIELDS[activeTab].map(field => (
                <SettingField
                  key={field.key}
                  field={field}
                  value={settings[field.key] || ''}
                  onChange={handleChange}
                />
              ))}
            </div>
          </div>

          {/* Right: Live Preview */}
          <div className="wc-preview-panel">
            <div className="wc-preview-sticky">
              <LivePreviewPanel settings={settings} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WebsiteCustomizer;
