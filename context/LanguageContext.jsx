'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '@/lib/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('ar');
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');

  useEffect(() => {
    const saved = localStorage.getItem('al_alamiah_lang');
    if (saved && (saved === 'ar' || saved === 'tr' || saved === 'en')) {
      setLang(saved);
    }
    const savedUser = localStorage.getItem('al_alamiah_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {}
    }
  }, []);

  const changeLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('al_alamiah_lang', newLang);
  };

  const loginUser = (userData) => {
    setUser(userData);
    localStorage.setItem('al_alamiah_user', JSON.stringify(userData));
    setIsAuthOpen(false);
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('al_alamiah_user');
  };

  const openAuth = (mode = 'signin') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const closeAuth = () => {
    setIsAuthOpen(false);
  };

  const t = translations[lang];

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang: changeLang,
        t,
        dir: t.dir,
        user,
        loginUser,
        logoutUser,
        isAuthOpen,
        authMode,
        setAuthMode,
        openAuth,
        closeAuth,
      }}
    >
      <div
        dir={t.dir}
        className="min-h-screen bg-[#0D041A] text-zinc-100 flex flex-col selection:bg-purple-600/40 selection:text-yellow-200"
      >
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
