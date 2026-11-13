'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Scissors, LogIn, LogOut } from 'lucide-react';

export default function Header() {
  const { lang, setLang, t, user, authUser, appRole, logoutUser, openAuth } = useLanguage();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#111315]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex min-h-11 items-center gap-2.5 text-zinc-100">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-amber-400">
            <Scissors className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold tracking-wide">
            {lang === 'ar' ? 'العالمية للحلاقة' : lang === 'tr' ? 'Uluslararası Berber' : 'Al-Alamiah'}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="language-select">{t.switchLang}</label>
          <select
            id="language-select"
            value={lang}
            onChange={(event) => setLang(event.target.value)}
            className="min-h-11 rounded-xl border border-white/10 bg-white/5 px-2 text-xs text-zinc-200 outline-none focus:border-white/25"
          >
            <option value="ar" className="bg-[#111315]">عربي</option>
            <option value="tr" className="bg-[#111315]">TR</option>
            <option value="en" className="bg-[#111315]">EN</option>
          </select>

          {appRole === 'admin' ? (
            <>
              <Link
                href="/admin"
                className="inline-flex min-h-11 items-center rounded-xl px-3 text-xs text-zinc-300 transition hover:bg-white/5 hover:text-white"
              >
                {lang === 'ar' ? 'لوحة الإدارة' : lang === 'tr' ? 'Yönetim paneli' : 'Admin'}
              </Link>
              <button
                type="button"
                onClick={logoutUser}
                title={t.nav.logout}
                className="flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-zinc-200 transition hover:bg-white/10"
              >
                <span className="hidden max-w-28 truncate sm:inline">{authUser?.email}</span>
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : user ? (
            <>
              <Link
                href="/dashboard"
                className="min-h-11 inline-flex items-center rounded-xl px-3 text-xs text-zinc-300 transition hover:bg-white/5 hover:text-white"
              >
                {lang === 'ar' ? 'لوحة الحلاق' : lang === 'tr' ? 'Berber paneli' : 'Dashboard'}
              </Link>
              <button
                type="button"
                onClick={logoutUser}
                title={t.nav.logout}
                className="flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-zinc-200 transition hover:bg-white/10"
              >
                <span className="hidden sm:inline">{user.name}</span>
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : authUser ? (
            <button
              type="button"
              onClick={logoutUser}
              title={t.nav.logout}
              className="flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-zinc-200 transition hover:bg-white/10"
            >
              <span className="hidden max-w-28 truncate sm:inline">
                {authUser.user_metadata?.full_name || authUser.email}
              </span>
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            <>
              <Link
                href="/auth"
                className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-xs font-medium text-zinc-300 transition hover:bg-white/5 hover:text-white"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">{t.nav.signIn}</span>
              </Link>
              <button
                type="button"
                onClick={() => openAuth('signin')}
                className="hidden min-h-11 rounded-xl border border-white/10 px-3 text-xs text-zinc-400 transition hover:bg-white/5 hover:text-zinc-100 sm:block"
              >
                {t.nav.barberAccount}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
