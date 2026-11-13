'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '@/lib/translations';
import { supabase } from '@/lib/supabase';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('ar');
  const [user, setUser] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [appRole, setAppRole] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');

  useEffect(() => {
    localStorage.removeItem('al_alamiah_user');
    const saved = localStorage.getItem('al_alamiah_lang');
    if (saved && (saved === 'ar' || saved === 'tr' || saved === 'en')) {
      setLang(saved);
    }

    let active = true;
    const loadBarber = async (authUser) => {
      if (!authUser) {
        if (active) {
          setUser(null);
          setAuthUser(null);
          setAppRole(null);
        }
        return;
      }

      if (active) setAuthUser(authUser);
      const [{ data: role, error: roleError }, { data, error }] = await Promise.all([
        supabase.from('user_roles').select('role').eq('user_id', authUser.id).maybeSingle(),
        supabase.from('barbers').select('*').eq('auth_user_id', authUser.id).maybeSingle(),
      ]);

      if (roleError || error) {
        console.error('Unable to load account access:', roleError?.message || error.message);
        return;
      }

      if (active) {
        setAppRole(role?.role || null);
        setUser(data ? { ...data, name: data.name } : null);
      }
    };

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('Unable to restore authentication session:', error.message);
        return;
      }
      loadBarber(data.session?.user);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      loadBarber(session?.user);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const changeLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('al_alamiah_lang', newLang);
  };

  const loginUser = (userData) => {
    setUser(userData);
    setIsAuthOpen(false);
  };

  const logoutUser = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Unable to sign out:', error.message);
      return;
    }
    setUser(null);
    setAppRole(null);
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
        authUser,
        appRole,
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
        className="flex min-h-screen flex-col bg-[#111315] text-zinc-100 selection:bg-amber-400 selection:text-zinc-950"
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
