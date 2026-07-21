import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import './ThemeSwitcher.css';

const MODES = [
  { id: 'light', icon: Sun, label: 'Light mode' },
  { id: 'dark', icon: Moon, label: 'Dark mode' },
  { id: 'system', icon: Monitor, label: 'System preference' },
];

export default function ThemeSwitcher() {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('appearance') || 'system';
  });

  function applyTheme(selected) {
    const html = document.documentElement;
    if (selected === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      html.setAttribute('data-theme', selected);
    }
  }

  useEffect(() => {
    localStorage.setItem('appearance', mode);
    applyTheme(mode);
    // Listen for system preference changes
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme(mode);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  return (
    <div className="theme-switcher" title="Theme preference">
      {MODES.map((m) => {
        const Icon = m.icon;
        const isActive = mode === m.id;
        return (
          <button
            key={m.id}
            type="button"
            className={`theme-switcher-btn ${isActive ? 'active' : ''}`}
            onClick={() => setMode(m.id)}
            title={m.label}
          >
            <Icon size={16} />
          </button>
        );
      })}
    </div>
  );
}
