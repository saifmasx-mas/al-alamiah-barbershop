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
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => openAuth('signin')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-purple-950 text-xs font-black hover:brightness-110 shadow-[0_0_20px_rgba(250,204,21,0.35)] active:scale-[0.98] transition-all"
              >
                {t.nav.barberAccount}
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
