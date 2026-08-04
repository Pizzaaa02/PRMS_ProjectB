import { Monitor, Smartphone, Tablet } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PreviewToolbar({ device, onDeviceChange }) {
  const devices = [
    { id: 'desktop', label: 'Desktop', icon: <Monitor size={16} /> },
    { id: 'tablet', label: 'Tablet', icon: <Tablet size={16} /> },
    { id: 'mobile', label: 'Mobile', icon: <Smartphone size={16} /> },
  ];

  return (
    <div className="pt-toolbar">
      {/* Left section: Page path / breadcrumb */}
      <div className="pt-toolbar-left">
        <span className="pt-breadcrumb">
          <span className="pt-breadcrumb-icon"><Monitor size={12} /></span>
          <span>http://localhost:3000</span>
        </span>
      </div>

      {/* Center: Device toggle */}
      <div className="pt-toolbar-center">
        {devices.map((dev) => (
          <motion.button
            key={dev.id}
            type="button"
            className={`pt-device-btn ${device === dev.id ? 'pt-device-active' : ''}`}
            onClick={() => onDeviceChange(dev.id)}
            whileTap={{ scale: 0.95 }}
            title={dev.label}
          >
            {dev.icon}
          </motion.button>
        ))}
      </div>

      {/* Right: zoom & other controls */}
      <div className="pt-toolbar-right">
        <span className="pt-zoom">100%</span>
      </div>
    </div>
  );
}
