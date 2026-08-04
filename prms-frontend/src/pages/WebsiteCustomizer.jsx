import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Undo, Redo, RotateCcw, Save, Share2, Wand2,
  Sun, Moon, Eye, EyeOff, Search, Plus,
  Edit3, ChevronDown, ChevronUp, Download, Upload,
  Trash2
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useCustomization } from '../contexts/CustomizationContext';
import { adminApi } from '../api/admin';
import PageTree from '../components/WebsiteCustomizerV2/PageTree';
import PropertiesPanel from '../components/WebsiteCustomizerV2/PropertiesPanel';
import PreviewToolbar from '../components/WebsiteCustomizerV2/PreviewToolbar';
import LivePreviewPanel from '../components/LivePreviewPanel';
import VersionHistory from '../components/VersionHistory';
import ThemeTemplates from '../components/ThemeTemplates';
import './WebsiteCustomizer.css';

/* Element -> properties mapping so clicking a tree node populates the right panel */
const ELEMENT_PROPERTIES_MAP = {
  hero: { text: 'Hero Section', visibility: true, lock: false, color: '', bg_color: '#8a2be2', font_size: 24, font_weight: '600', alignment: 'left', opacity: 100 },
  hero_title: { text: 'Find Your Perfect Rental Property', visibility: true, lock: false, color: '#ffffff', font_size: 42, font_weight: '700', alignment: 'left', opacity: 100 },
  hero_subtitle: { text: 'Discover top-quality rental properties tailored to your lifestyle and budget', visibility: true, lock: false, color: '#e2e8f0', font_size: 18, font_weight: '400', alignment: 'left', opacity: 100 },
  hero_cta: { button_text: 'Browse Properties', button_link: '/properties', visibility: true, lock: false, color: '#ffffff', bg_color: '#8a2be2', font_size: 16, font_weight: '600', alignment: 'center', border_radius: 8, opacity: 100 },
  hero_image: { image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab', alt_text: 'Modern building', visibility: true, lock: false, width: 100, height: 0, opacity: 100 },
  hero_background: { bg_color: '#0f172a', visibility: true, lock: false, opacity: 100 },
  search_bar: { visibility: true, lock: false, bg_color: '#ffffff', padding: 16, margin: 0, border_radius: 10, opacity: 100 },
  search_placeholder: { text: 'Search by location, property type...', visibility: true, lock: false, color: '#64748b', font_size: 14, font_weight: '400', opacity: 100 },
  search_button: { button_text: 'Search', button_link: '#', visibility: true, lock: false, color: '#ffffff', bg_color: '#8a2be2', font_size: 14, font_weight: '500', border_radius: 6, opacity: 100 },
  featured: { text: 'Featured Properties', visibility: true, lock: false, padding: 40, margin: 0, opacity: 100 },
  featured_title: { text: 'Featured Properties', visibility: true, lock: false, color: '#0f172a', font_size: 28, font_weight: '700', alignment: 'center', opacity: 100 },
  featured_cards: { visibility: true, lock: false, border_radius: 12, padding: 0, margin: 0, opacity: 100 },
  features: { text: 'Features', visibility: true, lock: false, padding: 40, margin: 0, opacity: 100 },
  features_title: { text: 'Our Features', visibility: true, lock: false, color: '#0f172a', font_size: 28, font_weight: '700', alignment: 'center', opacity: 100 },
  features_grid: { visibility: true, lock: false, padding: 24, margin: 0, opacity: 100 },
  testimonials: { text: 'Testimonials', visibility: true, lock: false, padding: 40, margin: 0, opacity: 100 },
  testimonials_title: { text: 'What Our Clients Say', visibility: true, lock: false, color: '#0f172a', font_size: 28, font_weight: '700', alignment: 'center', opacity: 100 },
  testimonials_cards: { visibility: true, lock: false, border_radius: 12, padding: 0, margin: 0, opacity: 100 },
  header_background_color: { visibility: true, lock: false, bg_color: '#ffffff', padding: 10, margin: 0, opacity: 100 },
  branding_site_name: { text: 'PRMS', visibility: true, lock: false, color: '#111827', font_size: 20, font_weight: '700', alignment: 'left', opacity: 100 },
  homepage_about_title: { text: 'About Us', visibility: true, lock: false, color: '#111827', font_size: 28, font_weight: '700', alignment: 'center', opacity: 100 },
  homepage_about_description: { text: 'Your trusted property management platform.', visibility: true, lock: false, color: '#6b7280', font_size: 16, font_weight: '400', alignment: 'center', opacity: 100 },
  footer_background_color: { visibility: true, lock: false, bg_color: '#f3f4f6', padding: 16, margin: 0, opacity: 100 },
  footer_copyright_text: { text: `© ${new Date().getFullYear()} PRMS. All rights reserved.`, visibility: true, lock: false, color: '#6b7280', font_size: 14, font_weight: '400', alignment: 'center', opacity: 100 },
  cta_section: { visibility: true, lock: false, bg_color: '#8a2be2', padding: 48, margin: 0, opacity: 100 },
  cta_title: { text: 'Start Your Property Journey Today', visibility: true, lock: false, color: '#ffffff', font_size: 32, font_weight: '700', alignment: 'center', opacity: 100 },
  cta_button: { button_text: 'Get Started', button_link: '/contact', visibility: true, lock: false, color: '#0f172a', bg_color: '#ffffff', font_size: 16, font_weight: '600', alignment: 'center', border_radius: 8, opacity: 100 },
};

export default function WebsiteCustomizer() {
  const { settings: allSettings, updateSetting, bulkUpdateSettings, loadSettings } = useSettings();
  const {
    selectedElement, setSelectedElement,
    editingTheme, setEditingTheme,
    draftConfig, setDraftConfig,
    updateElementStyle, undo, redo,
    historyPast, historyFuture,
    saveDraft: saveDraftAction, publish: publishAction, saving, publishing,
    factoryReset, discardChanges,
  } = useCustomization() || {};

  /* Local state */
  const [selectedId, setSelectedId] = useState('hero_title');
  const [device, setDevice] = useState('desktop');
  const [showPreview, setShowPreview] = useState(true);
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('customizer-theme') || 'light');
  const [elementProperties, setElementProperties] = useState({});
  const [loading, setLoading] = useState(false);
  const [themeId, setThemeId] = useState(null);
  const [currentVersion, setCurrentVersion] = useState(1);
  const [showTemplates, setShowTemplates] = useState(false);
  const [editMode, setEditMode] = useState(false);

  /* Load theme info on mount */
  useEffect(() => {
    adminApi.getTheme().then(res => {
      const id = res?.data?.data?.id;
      setThemeId(id);
      setCurrentVersion(res?.data?.data?.version || 1);
    }).catch(() => {});
  }, []);

  /* Load default properties for selected element */
  const getProperties = useCallback((eid) => {
    return ELEMENT_PROPERTIES_MAP[eid] || {
      text: '', visibility: true, lock: false,
      color: '', bg_color: '', font_size: 16, font_weight: '400',
      alignment: 'left', opacity: 100, padding: 0, margin: 0,
      border_radius: 0, width: 100, height: 0,
    };
  }, []);

  /* Sync local properties when selection changes */
  useEffect(() => {
    if (selectedId) {
      setElementProperties(getProperties(selectedId));
      setSelectedElement({ id: selectedId });
    }
  }, [selectedId]);

  const handleSelectElement = useCallback((id) => {
    setSelectedId(id);
  }, []);

  const saveDraft = async () => {
    const dirty = getDirtySettings();
    setLoading(true);
    try {
      if (dirty.length > 0 && bulkUpdateSettings) {
        await bulkUpdateSettings(dirty);
      }
      if (saveDraftAction) {
        await saveDraftAction(themeId);
      }
    } catch (err) {
      console.error('Save draft failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const publishTheme = async () => {
    setLoading(true);
    try {
      const dirty = getDirtySettings();
      if (dirty.length > 0 && bulkUpdateSettings) {
        await bulkUpdateSettings(dirty);
      }
      if (publishAction) {
        await publishAction(themeId);
      } else {
        const themeResp = await adminApi.getTheme();
        const tid = themeResp?.data?.data?.id;
        if (tid) await adminApi.publishTheme(tid);
      }
    } catch (err) {
      console.error('Publish failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (mode) => {
    setThemeMode(mode);
    localStorage.setItem('customizer-theme', mode);
    document.documentElement.setAttribute('data-theme', mode);
  };

  const resetAll = () => {
    if (factoryReset) {
      factoryReset();
    } else {
      if (window.confirm('Reset all customizations?')) {
        setElementProperties({});
      }
    }
  };

  const undoAction = () => {
    if (undo) undo();
  };

  const redoAction = () => {
    if (redo) redo();
  };

  /* Map element property keys -> setting keys (per-element for accuracy) */
  const ELEMENT_SETTING_MAP = {
    hero_title: { text: 'homepage_hero_title', color: 'homepage_hero_title_color', font_size: 'homepage_hero_title_font_size', font_weight: 'homepage_hero_title_font_weight', alignment: 'homepage_hero_text_alignment' },
    hero_subtitle: { text: 'homepage_hero_subtitle', color: 'homepage_hero_subtitle_color', font_size: 'homepage_hero_subtitle_font_size' },
    hero_cta: { button_text: 'homepage_hero_button_text', color: 'homepage_hero_button_color', bg_color: 'homepage_hero_button_background_color' },
    hero_background: { bg_color: 'homepage_hero_background_color' },
    search_placeholder: { text: 'homepage_search_placeholder' },
    search_button: { button_text: 'homepage_search_button_text', bg_color: 'homepage_search_button_background_color' },
    featured_title: { text: 'homepage_featured_title', color: 'homepage_featured_title_color', font_size: 'homepage_featured_title_font_size' },
    features_title: { text: 'homepage_features_title' },
    testimonials_title: { text: 'homepage_testimonials_title' },
    cta_title: { text: 'homepage_cta_title', color: 'homepage_cta_title_color' },
    cta_button: { button_text: 'homepage_cta_button_text', bg_color: 'homepage_cta_button_background_color' },
    header_background_color: { bg_color: 'header_background_color' },
    branding_site_name: { text: 'branding_site_name' },
    footer_background_color: { bg_color: 'footer_background_color' },
    footer_copyright_text: { text: 'footer_copyright_text' },
    homepage_about_title: { text: 'homepage_about_title' },
    homepage_about_description: { text: 'homepage_about_description' },
  };

  /* Fallback for unmapped elements */
  const GENERIC_SETTING_MAP = {
    color: 'theme_text_color',
    bg_color: 'theme_background_color',
    font_size: 'theme_font_size_base',
    font_weight: 'theme_font_weight',
    alignment: 'header_alignment',
    opacity: 'theme_opacity',
    padding: 'theme_padding_base',
    margin: 'theme_margin_base',
  };

  const mapElementKeyToSetting = (elementId, propKey) => {
    const perElement = ELEMENT_SETTING_MAP[elementId];
    if (perElement && perElement[propKey]) return perElement[propKey];
    return GENERIC_SETTING_MAP[propKey] || null;
  };

  /* Reverse map: LivePreview sends setting keys -> resolve to PageTree node IDs */
  const SETTING_TO_NODE_ID = {
    homepage_hero_title: 'hero_title',
    homepage_hero_subtitle: 'hero_subtitle',
    homepage_hero_button_text: 'hero_cta',
    homepage_hero_background_color: 'hero_background',
    header_background_color: 'header_background_color',
    branding_site_name: 'branding_site_name',
    footer_background_color: 'footer_background_color',
    footer_copyright_text: 'footer_copyright_text',
    homepage_about_title: 'homepage_about_title',
    homepage_about_description: 'homepage_about_description',
  };

  /* Collect dirty settings */
  const getDirtySettings = () => {
    if (!allSettings) return [];
    const dirty = [];
    for (const [key, value] of Object.entries(allSettings)) {
      const defaultVal = getDefaultValue(key);
      if (String(value) !== String(defaultVal)) {
        dirty.push({ key, value: String(value) });
      }
    }
    return dirty;
  };

  const getDefaultValue = (key) => {
    const DEFAULTS = {
      theme_primary_color: '#8a2be2',
      theme_secondary_color: '#0f172a',
      theme_accent_color: '#b84cff',
    };
    return DEFAULTS[key] || '';
  };

  /* ---- Actions ---- */

  const handlePropertyChange = useCallback((key, value) => {
    setElementProperties((prev) => ({ ...prev, [key]: value }));

    /* Sync back to the settings context for live preview */
    if (allSettings) {
      const settingKey = mapElementKeyToSetting(selectedId, key);
      if (settingKey) {
        updateSetting(settingKey, String(value));
      }
    }
  }, [selectedId, allSettings, updateSetting]);

  /* ---- Preview click handler: setting key -> PageTree node ID ---- */
  const handlePreviewElementClick = useCallback((settingKey) => {
    const nodeId = SETTING_TO_NODE_ID[settingKey] || settingKey;
    setSelectedId(nodeId);
  }, []);

  /* Device width class for preview */
  const deviceWidth = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  return (
    <motion.div
      className="wc2-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* ========== PAGE HEADER ========== */}
      <header className="wc2-header">
        <div className="wc2-header-left">
          <h1 className="wc2-title">Website Customizer</h1>
          <p className="wc2-subtitle">
            Visual editor for your public-facing website. Click elements in the tree, edit properties on the right.
          </p>
        </div>
        <div className="wc2-header-right">
          {/* Theme mode */}
          <div className="wc2-theme-group">
            {[
              { id: 'light', icon: Sun, label: 'Light' },
              { id: 'dark', icon: Moon, label: 'Dark' },
            ].map((opt) => (
              <motion.button
                key={opt.id}
                type="button"
                className={`wc2-theme-btn ${themeMode === opt.id ? 'wc2-theme-active' : ''}`}
                onClick={() => applyTheme(opt.id)}
                whileTap={{ scale: 0.95 }}
              >
                <opt.icon size={13} />
                <span className="wc2-theme-label">{opt.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Undo/Redo */}
          <motion.button type="button" className="wc2-icon-btn" onClick={undoAction} whileTap={{ scale: 0.95 }} title="Undo" disabled={!historyPast?.length}>
            <Undo size={14} />
          </motion.button>
          <motion.button type="button" className="wc2-icon-btn" onClick={redoAction} whileTap={{ scale: 0.95 }} title="Redo" disabled={!historyFuture?.length}>
            <Redo size={14} />
          </motion.button>

          {/* Edit mode toggle */}
          <motion.button
            type="button"
            className={`wc2-edit-btn ${editMode ? 'wc2-edit-on' : ''}`}
            onClick={() => setEditMode((v) => !v)}
            whileTap={{ scale: 0.96 }}
          >
            <Edit3 size={13} />
            <span>{editMode ? 'Editing ON' : 'Edit Mode'}</span>
          </motion.button>

          {/* Reset */}
          <motion.button type="button" className="wc2-reset-btn" onClick={resetAll} whileTap={{ scale: 0.96 }}>
            <RotateCcw size={13} />
            <span>Reset</span>
          </motion.button>

          {/* Save / Publish */}
          <motion.button
            type="button"
            className="wc2-save-btn"
            onClick={saveDraft}
            disabled={loading || saving}
            whileTap={{ scale: 0.96 }}
          >
            <Save size={13} />
            <span>{saving || loading ? 'Saving...' : 'Save Draft'}</span>
          </motion.button>

          <motion.button
            type="button"
            className="wc2-publish-btn"
            onClick={publishTheme}
            disabled={loading || publishing}
            whileTap={{ scale: 0.96 }}
          >
            <Share2 size={13} />
            <span>Publish</span>
          </motion.button>
        </div>
      </header>

      {/* ========== MAIN 3-COLUMN LAYOUT ========== */}
      <div className="wc2-body">
        {/* ---- LEFT: Page Tree ---- */}
        <PageTree selectedId={selectedId} onSelect={handleSelectElement} />

        {/* ---- CENTER: Preview area ---- */}
        <div className="wc2-preview-area">
          {/* Toolbar above preview */}
          <PreviewToolbar device={device} onDeviceChange={setDevice} />

          {/* Preview canvas */}
          {showPreview && (
            <div className="wc2-canvas" style={{ maxWidth: deviceWidth[device], margin: '0 auto' }}>
              <LivePreviewPanel onElementClick={handlePreviewElementClick} />
            </div>
          )}

          {/* Toggle preview visibility */}
          {!showPreview && (
            <div className="wc2-preview-hidden">
              <EyeOff size={48} className="wc2-preview-hidden-icon" />
              <p>Preview hidden</p>
              <button type="button" className="wc2-preview-show-btn" onClick={() => setShowPreview(true)}>
                <Eye size={14} /> Show Preview
              </button>
            </div>
          )}

          {/* Version history below preview */}
          {showPreview && themeId && (
            <div className="wc2-history-wrap">
              <VersionHistory
                themeId={themeId}
                currentVersion={currentVersion}
                onRestore={async (v) => {
                  if (!window.confirm(`Restore to version ${v}?`)) return;
                  try {
                    await adminApi.restoreVersion(themeId, v);
                    await loadSettings();
                  } catch {}
                }}
              />
            </div>
          )}
        </div>

        {/* ---- RIGHT: Properties Panel ---- */}
        <PropertiesPanel
          selectedId={selectedId}
          properties={elementProperties}
          onChange={handlePropertyChange}
        />
      </div>

      {/* ========== BOTTOM TOOLBAR ========== */}
      <div className="wc2-bottom">
        <div className="wc2-bottom-left">
          {historyPast && (
            <span className="wc2-history-count">
              {historyPast.length} step{historyPast.length !== 1 ? 's' : ''} back
            </span>
          )}
          {historyFuture && (
            <span className="wc2-history-count">
              {historyFuture.length} step{historyFuture.length !== 1 ? 's' : ''} forward
            </span>
          )}
        </div>
        <div className="wc2-bottom-right">
          <motion.button
            type="button"
            className="wc2-bottom-icon"
            onClick={() => setShowPreview((v) => !v)}
            whileTap={{ scale: 0.96 }}
          >
            {showPreview ? <EyeOff size={13} /> : <Eye size={13} />}
          </motion.button>

          <motion.button
            type="button"
            className="wc2-bottom-icon"
            onClick={() => setShowTemplates((v) => !v)}
            whileTap={{ scale: 0.96 }}
          >
            <Wand2 size={13} />
          </motion.button>

          <motion.button
            type="button"
            className="wc2-bottom-icon"
            onClick={async () => {
              if (discardChanges) await discardChanges();
            }}
            whileTap={{ scale: 0.96 }}
          >
            <Trash2 size={13} />
          </motion.button>
        </div>
      </div>

      {/* ========== TEMPLATES MODAL ========== */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            className="wc2-templates-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTemplates(false)}
          >
            <motion.div
              className="wc2-templates-modal"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Theme Templates</h3>
              <ThemeTemplates
                onApply={(preset) => {
                  /* Apply preset settings via bulk update */
                  const vals = {};
                  Object.entries(preset.settings).forEach(([k, v]) => {
                    vals[k] = v;
                  });
                  if (bulkUpdateSettings) {
                    bulkUpdateSettings(Object.entries(vals).map(([key, value]) => ({ key, value: String(value) })));
                  }
                  setShowTemplates(false);
                  window.alert(`Template "${preset.name}" applied. Click "Save Draft" to persist.`);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
