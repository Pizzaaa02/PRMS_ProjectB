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
import CustomizationPanel from '../components/CustomizationPanel';
import SettingField from '../components/SettingField';
import LivePreviewPanel from '../components/LivePreviewPanel';
import './Customize.css';

/* ============================================================
   Tab definitions — categories of settings with their fields
   ============================================================ */
const CATEGORIES = [
  {
    id: 'branding', icon: Palette, label: 'Branding',
    fields: [
      { key: 'branding_site_name', label: 'Site Name', type: 'text' },
      { key: 'branding_company_name', label: 'Company Name', type: 'text' },
      { key: 'branding_logo_url', label: 'Logo URL', type: 'text' },
      { key: 'branding_primary_color', label: 'Primary Color', type: 'color' },
      { key: 'branding_accent_color', label: 'Accent Color', type: 'color' },
      { key: 'branding_favicon_url', label: 'Favicon URL', type: 'text' },
    ],
  },
  {
    id: 'typography', icon: TypeIcon, label: 'Typography',
    fields: [
      { key: 'typography_body_font', label: 'Body Font', type: 'select', options: ['Inter', 'Open Sans', 'Roboto', 'Poppins', 'Lato'] },
      { key: 'typography_heading_font', label: 'Heading Font', type: 'select', options: ['Inter', 'Open Sans', 'Roboto', 'Poppins', 'Lato'] },
      { key: 'typography_base_font_size', label: 'Base Size (px)', type: 'text' },
      { key: 'typography_heading_size', label: 'Heading Size (px)', type: 'text' },
      { key: 'typography_line_height', label: 'Line Height', type: 'text' },
    ],
  },
  {
    id: 'layout', icon: Layout, label: 'Layout',
    fields: [
      { key: 'layout_max_width', label: 'Max Width', type: 'text' },
      { key: 'layout_page_padding', label: 'Page Padding', type: 'text' },
      { key: 'layout_content_width', label: 'Content Width', type: 'text' },
      { key: 'layout_grid_gap', label: 'Grid Gap', type: 'text' },
      { key: 'layout_border_radius', label: 'Border Radius', type: 'text' },
    ],
  },
  {
    id: 'home', icon: ImageIcon, label: 'Home',
    fields: [
      { key: 'home_hero_title', label: 'Hero Title', type: 'text' },
      { key: 'home_hero_subtitle', label: 'Hero Subtitle', type: 'textarea' },
      { key: 'home_hero_cta', label: 'Hero CTA', type: 'text' },
      { key: 'home_hero_image', label: 'Hero Image', type: 'text' },
      { key: 'home_featured_heading', label: 'Featured Heading', type: 'text' },
      { key: 'home_enable_search', label: 'Enable Search', type: 'toggle' },
      { key: 'home_enable_categories', label: 'Show Categories', type: 'toggle' },
    ],
  },
  {
    id: 'seo', icon: MessageSquare, label: 'SEO',
    fields: [
      { key: 'seo_meta_title', label: 'Meta Title', type: 'text' },
      { key: 'seo_meta_description', label: 'Meta Description', type: 'textarea' },
      { key: 'seo_keywords', label: 'Keywords', type: 'text' },
      { key: 'seo_meta_image', label: 'Meta Image', type: 'text' },
      { key: 'seo_enable_sitemap', label: 'Enable Sitemap', type: 'toggle' },
      { key: 'seo_enable_og_tags', label: 'Open Graph Tags', type: 'toggle' },
    ],
  },
  {
    id: 'advanced', icon: Settings, label: 'Advanced',
    fields: [
      { key: 'advanced_custom_css', label: 'Custom CSS', type: 'textarea' },
      { key: 'advanced_footer_text', label: 'Footer Text', type: 'text' },
      { key: 'advanced_show_language', label: 'Show Language Switcher', type: 'toggle' },
      { key: 'advanced_show_theme', label: 'Show Theme Toggle', type: 'toggle' },
    ],
  },
];

/* ============================================================
   Customize — consolidated page (replaces WebsiteCustomizer)
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

  const currentCat = CATEGORIES.find((c) => c.id === activeTab);

  /* ---- helpers ---- */

  const getSettingValue = useCallback(
    (key) => {
      return allSettings?.[key] ?? '';
    },
    [allSettings],
  );

  /* ---- edit mode ---- */

  const toggleFieldEdit = (key) => {
    setEditingFields((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  /* ---- theme ---- */

  const applyThemeMode = (mode) => {
    setThemeMode(mode);
    localStorage.setItem('customizer-theme', mode);
    document.documentElement.setAttribute('data-theme', mode);
  };

  /* ---- actions ---- */

  const discard = () => {
    setEditingFields({});
  };

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
            Style colors, typography, layout, hero content, and SEO settings.
          </p>
        </div>

        <div className="wc-header-controls">
          {/* Theme mode dropdown toggle */}
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
            onClick={() => {
              discard();
            }}
            whileTap={{ scale: 0.96 }}
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </motion.button>

          {/* Factory Reset */}
          <motion.button
            type="button"
            className="wc-reset-btn factory-reset"
            onClick={() => {
              setEditingFields({});
              setShowPreview(true);
            }}
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
            {CATEGORIES.map((cat) => (
              <motion.button
                key={cat.id}
                type="button"
                className={`wc-tab ${activeTab === cat.id ? 'wc-tab-active' : ''}`}
                onClick={() => setActiveTab(cat.id)}
                whileTap={{ scale: 0.96 }}
              >
                <cat.icon size={16} />
                <span>{cat.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Current tab fields */}
          <div className="wc-tab-content">
            {currentCat?.fields.map((field) => {
              const value = getSettingValue(field.key);
              const isEditing = editingFields[field.key];

              return (
                <SettingField
                  key={field.key}
                  field={field}
                  value={value}
                  onChange={(v) => {
                    if (isEditing) {
                      setEditingFields((prev) => ({
                        ...prev,
                        [field.key]: v,
                      }));
                    }
                  }}
                  onToggleEdit={() => toggleFieldEdit(field.key)}
                  isEditing={isEditing}
                  settingsRef={allSettings}
                />
              );
            })}
          </div>

          {/* ---- Element-level editor (when Edit Elements is ON) ---- */}
          {editingElements && (
            <div style={{ padding: '20px 24px', borderTop: '1px solid #e5e7eb' }}>
              <CustomizationPanel onElementClick={console.log} />
            </div>
          )}
        </div>

        {/* ---- Preview Panel ---- */}
        {showPreview && (
          <div className="wc-preview-panel">
            <div className="wc-preview-sticky">
              <LivePreviewPanel />
            </div>
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
            {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
            <span>{showPreview ? 'Hide' : 'Show'} Preview</span>
          </motion.button>
        </div>

        <div className="wc-toolbar-group">
          <motion.button
            type="button"
            className="wc-toolbar-btn wc-toolbar-btn-save"
            onClick={async () => {
              setLoading(true);
              try {
                await loadSettings();
                setEditingFields({});
              } finally {
                setLoading(false);
              }
            }}
            whileTap={{ scale: 0.96 }}
            disabled={loading}
          >
            <Save size={14} />
            <span>{loading ? 'Saving...' : 'Save Draft'}</span>
          </motion.button>

          <motion.button
            type="button"
            className="wc-toolbar-btn wc-toolbar-btn-publish"
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
