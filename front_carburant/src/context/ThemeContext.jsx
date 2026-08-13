import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app_theme') || 'dark';
  });

  const [colorScheme, setColorScheme] = useState(() => {
    return localStorage.getItem('app_color_scheme') || 'red';
  });

  // Fetch initial theme & color scheme settings from MySQL database
  useEffect(() => {
    fetchSystemSettings();
    // Optional polling every 10 seconds to sync theme changes across all user screens in real-time
    const interval = setInterval(fetchSystemSettings, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystemSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data?.success && res.data?.data) {
        const { color_scheme: apiColorScheme, theme: apiTheme } = res.data.data;
        if (apiColorScheme && apiColorScheme !== colorScheme) {
          setColorScheme(apiColorScheme);
        }
        if (apiTheme && apiTheme !== theme) {
          setTheme(apiTheme);
        }
      }
    } catch (err) {
      // Fallback silently if unauthenticated or offline
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-color-scheme', colorScheme);
    localStorage.setItem('app_color_scheme', colorScheme);
  }, [colorScheme]);

  const toggleTheme = async () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try {
      await api.post('/settings', { theme: nextTheme });
    } catch (err) {
      console.error(err);
    }
  };

  const changeColorScheme = async (scheme) => {
    setColorScheme(scheme);
    try {
      await api.post('/settings', { color_scheme: scheme });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colorScheme, changeColorScheme, fetchSystemSettings }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
