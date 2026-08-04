import { useState, useCallback, useMemo } from 'react';
import {
  Type as TypeIcon, ImageIcon, Palette, Maximize2,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Eye, EyeOff, Lock, Unlock, Grid3X3, List,
  DivideIcon as Divide
} from 'lucide-react';

/* ---- Content properties (first tab in the reference) ---- */
const CONTENT_FIELDS = [
  { key: 'text', label: 'Text', type: 'text', icon: <TypeIcon size={15} /> },
  { key: 'image', label: 'Image URL', type: 'text', icon: <ImageIcon size={15} /> },
  { key: 'alt_text', label: 'Alt Text', type: 'text', icon: <TypeIcon size={15} /> },
  { key: 'button_text', label: 'Button Text', type: 'text', icon: <TypeIcon size={15} /> },
  { key: 'button_link', label: 'Link', type: 'text', icon: <TypeIcon size={15} /> },
  { key: 'visibility', label: 'Visibility', type: 'toggle', icon: <Eye size={15} /> },
  { key: 'lock', label: 'Locked', type: 'toggle', icon: <Lock size={15} /> },
];

/* ---- Style properties (second tab in the reference) ---- */
const STYLE_FIELDS = [
  { key: 'color', label: 'Text Color', type: 'color', icon: <Palette size={15} /> },
  { key: 'bg_color', label: 'Background', type: 'color', icon: <Palette size={15} /> },
  { key: 'font_size', label: 'Font Size', type: 'number', unit: 'px', icon: <TypeIcon size={15} /> },
  { key: 'font_weight', label: 'Font Weight', type: 'select', options: ['300', '400', '500', '600', '700'], icon: <TypeIcon size={15} /> },
  { key: 'alignment', label: 'Alignment', type: 'alignment', icon: <AlignCenter size={15} /> },
  { key: 'width', label: 'Width', type: 'number', unit: '%', icon: <Maximize2 size={15} /> },
  { key: 'height', label: 'Height', type: 'number', unit: 'px', icon: <Maximize2 size={15} /> },
  { key: 'padding', label: 'Padding', type: 'number', unit: 'px', icon: <Maximize2 size={15} /> },
  { key: 'margin', label: 'Margin', type: 'number', unit: 'px', icon: <Maximize2 size={15} /> },
  { key: 'border_radius', label: 'Border Radius', type: 'number', unit: 'px', icon: <Palette size={15} /> },
  { key: 'opacity', label: 'Opacity', type: 'range', min: 0, max: 100, icon: <Eye size={15} /> },
  { key: 'border', label: 'Border Width', type: 'number', unit: 'px', icon: <Divide size={15} /> },
];

const ALIGN_OPTIONS = [
  { value: 'left', icon: <AlignLeft size={14} /> },
  { value: 'center', icon: <AlignCenter size={14} /> },
  { value: 'right', icon: <AlignRight size={14} /> },
];

function PropertyRow({ field, value, onChange }) {
  switch (field.type) {
    case 'text':
      return (
        <div className="rp-row">
          <label className="rp-label">
            <span className="rp-field-icon">{field.icon}</span>
            {field.label}
          </label>
          <input
            type="text"
            className="rp-input"
            value={value || ''}
            onChange={(e) => onChange(field.key, e.target.value)}
          />
        </div>
      );
    case 'color':
      return (
        <div className="rp-row">
          <label className="rp-label">
            <span className="rp-field-icon">{field.icon}</span>
            {field.label}
          </label>
          <div className="rp-color-wrap">
            <input
              type="color"
              className="rp-color"
              value={value || '#000000'}
              onChange={(e) => onChange(field.key, e.target.value)}
            />
            <input
              type="text"
              className="rp-color-text"
              value={value || ''}
              onChange={(e) => onChange(field.key, e.target.value)}
            />
          </div>
        </div>
      );
    case 'number':
      return (
        <div className="rp-row">
          <label className="rp-label">
            <span className="rp-field-icon">{field.icon}</span>
            {field.label}
          </label>
          <div className="rp-number-wrap">
            <input
              type="number"
              className="rp-number"
              value={value ?? ''}
              onChange={(e) => onChange(field.key, parseInt(e.target.value) || 0)}
            />
            {field.unit && <span className="rp-unit">{field.unit}</span>}
          </div>
        </div>
      );
    case 'range':
      return (
        <div className="rp-row">
          <label className="rp-label">
            <span className="rp-field-icon">{field.icon}</span>
            {field.label}
          </label>
          <div className="rp-range-wrap">
            <input
              type="range"
              className="rp-range"
              min={field.min}
              max={field.max}
              value={value ?? 100}
              onChange={(e) => onChange(field.key, parseInt(e.target.value))}
            />
            <span className="rp-range-val">{value ?? 100}%</span>
          </div>
        </div>
      );
    case 'select':
      return (
        <div className="rp-row">
          <label className="rp-label">
            <span className="rp-field-icon">{field.icon}</span>
            {field.label}
          </label>
          <select
            className="rp-select"
            value={value ?? '400'}
            onChange={(e) => onChange(field.key, e.target.value)}
          >
            {field.options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      );
    case 'alignment':
      return (
        <div className="rp-row">
          <label className="rp-label">
            <span className="rp-field-icon">{field.icon}</span>
            {field.label}
          </label>
          <div className="rp-align-group">
            {ALIGN_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`rp-align-btn ${value === opt.value ? 'rp-align-btn-active' : ''}`}
                onClick={() => onChange(field.key, opt.value)}
              >
                {opt.icon}
              </button>
            ))}
          </div>
        </div>
      );
    case 'toggle':
      return (
        <div className="rp-row">
          <label className="rp-label">
            <span className="rp-field-icon">{field.icon}</span>
            {field.label}
          </label>
          <button
            type="button"
            className={`rp-toggle ${value ? 'rp-toggle-on' : 'rp-toggle-off'}`}
            onClick={() => onChange(field.key, !value)}
          >
            {value ? (
              <span className="rp-toggle-dot on" />
            ) : (
              <span className="rp-toggle-dot off" />
            )}
          </button>
        </div>
      );
    default:
      return null;
  }
}

export default function PropertiesPanel({ selectedId, properties, onChange }) {
  const [activeTab, setActiveTab] = useState('content');

  const fields = activeTab === 'content' ? CONTENT_FIELDS : STYLE_FIELDS;

  const tabIcons = useMemo(() => [
    { id: 'content', label: 'Content', icon: <TypeIcon size={14} /> },
    { id: 'style', label: 'Style', icon: <Palette size={14} /> },
  ], []);

  return (
    <div className="rp-sidebar">
      {/* Element name at top */}
      <div className="rp-element-name">
        <span className="rp-element-badge">{selectedId || 'element'}</span>
      </div>

      {/* Tabs */}
      <div className="rp-tabs">
        {tabIcons.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`rp-tab ${activeTab === tab.id ? 'rp-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Fields */}
      <div className="rp-fields">
        {fields.map((field) => (
          <PropertyRow
            key={field.key}
            field={field}
            value={properties?.[field.key]}
            onChange={onChange}
          />
        ))}
      </div>
    </div>
  );
}
