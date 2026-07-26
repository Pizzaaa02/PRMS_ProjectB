import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { userApi } from '../api/user';

const UserPreferencesContext = createContext(null);

export function UserPreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState({
    appearance: 'system',
    notifications_enabled: true,
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const [loading, setLoading] = useState(true);

  const loadPreferences = useCallback(async () => {
    try {
      const me = await userApi.getMe?.() || { data: {} };
      if (me.data?.preferences) setPreferences(me.data.preferences);
      else {
        const res = await userApi.get('/auth/me');
        if (res.data?.preferences) setPreferences(res.data.preferences);
      }
    } catch (e) {
      console.warn('Failed to load preferences:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const updatePreferences = useCallback(async (updates) => {
    try {
      const res = await userApi.updateMe(updates);
      if (res.data?.preferences) setPreferences(prev => ({ ...prev, ...res.data.preferences }));
      return res;
    } catch (e) {
      console.error('Failed to update preferences:', e);
      throw e;
    }
  }, []);

  return (
    <UserPreferencesContext.Provider value={{ preferences, loading, updatePreferences }}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const ctx = useContext(UserPreferencesContext);
  if (!ctx) throw new Error('useUserPreferences must be used within UserPreferencesProvider');
  return ctx;
}