'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Scissors, LogOut, PhoneCall, Sparkles } from 'lucide-react';

export default function Header() {
  const { lang, setLang, t, user, logoutUser, openAuth } = useLanguage();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-[#130728]/85 border-b border-amber-400/20 shadow-[0_10px_30px_rgba(10,2,22,0.8)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 p-0.5 shadow-[0_0_25px_rgba(234,179,8,0.4)] group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#180A2F] rounded-[14px] flex items-center justify-center text-amber-300">
              <Scissors className="w-5 h-5 -rotate-45" />
            </div>
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div>
            <span className="text-lg sm:text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-500 block">
              {lang === 'ar' ? 'العالمية للحلاقة' : lang === 'tr' ? 'Uluslararası Berber' : 'Al-Alamiah Barbershop'}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-purple-300 font-bold block">
              Royal VIP Atelier
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-purple-200/90">
          <Link href="/" className="hover:text-yellow-300 hover:drop-shadow-[0_0_12px_rgba(250,204,21,0.5)] transition-all">
            {t.nav.home}
          </Link>
          <a href="/#booking-section" className="hover:text-yellow-300 hover:drop-shadow-[0_0_12px_rgba(250,204,21,0.5)] transition-all">
            {t.nav.book}
          </a>
          <Link href="/contact" className="hover:text-yellow-300 hover:drop-shadow-[0_0_12px_rgba(250,204,21,0.5)] transition-all">
            {t.nav.contact}
          </Link>
        </nav>

        {/* Right Section: Language Switcher + Auth Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Language Switcher */}
          <div className="flex items-center bg-[#1D0C38]/90 p-1 rounded-xl border border-purple-500/30 shadow-inner">
            {[
              { code: 'ar', label: 'عربي' },
              { code: 'tr', label: 'TR' },
              { code: 'en', label: 'EN' },
            ].map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => setLang(item.code)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  lang === item.code
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-purple-950 shadow-[0_0_12px_rgba(250,204,21,0.4)]'
                    : 'text-purple-300 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* User Logged in / Guest Auth */}
          {user ? (
            <div className="flex items-center gap-2 bg-[#1E0E3B] py-1.5 px-3 rounded-2xl border border-amber-400/30">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-400 text-purple-950 flex items-center justify-center text-xs font-black shadow-sm">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-xs font-bold text-yellow-100 hidden sm:inline max-w-[100px] truncate">
                {user.name}
              </span>
              <button
                onClick={logoutUser}
                title={t.nav.logout}
                className="text-purple-300 hover:text-rose-400 transition-colors p-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Google Quick Sign-in Icon Button */}
              <button
                type="button"
                onClick={() => openAuth('signin')}
                title="تسجيل الدخول عبر Google"
                className="p-2.5 rounded-xl bg-[#1E0E3B] hover:bg-[#2A1350] border border-amber-400/25 hover:border-amber-400 text-white transition-all duration-200 shadow-sm hover:scale-105"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.93 6.72-4.93z"
                  />
                </svg>
              </button>

              {/* Sign In Button */}
              <button
                type="button"
                onClick={() => openAuth('signin')}
                className="hidden sm:inline-block px-3 py-2 text-xs font-bold text-purple-200 hover:text-yellow-300 transition-colors"
              >
                {t.nav.signIn}
              </button>

              {/* Sign Up Button (Royal Gold Gradient) */}
              <button
                type="button"
                onClick={() => openAuth('signup')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-purple-950 text-xs font-black hover:brightness-110 shadow-[0_0_20px_rgba(250,204,21,0.35)] active:scale-[0.98] transition-all"
              >
                {t.nav.signUp}
              </button>
            </div>
          )}

          {/* Mobile Contact Link icon */}
          <Link
            href="/contact"
            title={t.nav.contact}
            className="md:hidden p-2 rounded-xl bg-[#1E0E3B] text-yellow-300 border border-amber-400/30"
          >
            <PhoneCall className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
