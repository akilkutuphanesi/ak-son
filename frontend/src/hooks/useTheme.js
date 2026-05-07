/**
 * useTheme.js
 * ─────────────────────────────────────────────
 * Global tema yönetim hook'u.
 *
 * Desteklenen temalar:
 *   'dark'  → Varsayılan koyu mod (#0a0f1d tabanlı)
 *   'light' → Aydınlık mod (CSS invert filter ile)
 *
 * Kullanım:
 *   const { theme, isLight, toggleLight, setTheme } = useTheme();
 */

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'akil_theme';
const LIGHT_CLASS = 'light-mode';

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'dark';
  });

  // Tema değişince <html> sınıfını ve localStorage'ı güncelle
  useEffect(() => {
    const html = document.documentElement; // <html> elementi

    if (theme === 'light') {
      html.classList.add(LIGHT_CLASS);
    } else {
      html.classList.remove(LIGHT_CLASS);
    }

    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // Sayfa ilk yüklendiğinde kaydedilmiş temayı uygula
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light') {
      document.documentElement.classList.add(LIGHT_CLASS);
    }
  }, []);

  const setTheme = (newTheme) => setThemeState(newTheme);

  // Dark ↔ Light arasında geçiş
  const toggleLight = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  return {
    theme,
    isLight: theme === 'light',
    isDark:  theme === 'dark',
    setTheme,
    toggleLight,
    // Geriye dönük uyumluluk (eski adlarla çağıranlar için)
    isSepia: false,
    toggleSepia: toggleLight,
  };
}

