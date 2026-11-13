'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { t, user, appRole, openAuth } = useLanguage();

  return (
    <footer className="mt-auto border-t border-white/10 bg-[#111315]/70 pb-20 text-zinc-400 sm:pb-0">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>{t.footer.rights}</p>
        <Link href="/contact" className="min-h-11 inline-flex items-center text-zinc-300 transition hover:text-white">
          {t.nav.contact}
        </Link>
      </div>
      <nav
        aria-label="Primary navigation"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-white/10 bg-[#111315]/95 px-3 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-xl sm:hidden"
      >
        <Link href="/#booking-section" className="flex min-h-12 items-center justify-center rounded-xl text-sm font-medium text-zinc-200">
          {t.nav.book}
        </Link>
        <Link href="/contact" className="flex min-h-12 items-center justify-center rounded-xl text-sm font-medium text-zinc-400">
          {t.nav.contact}
        </Link>
        {appRole === 'admin' ? (
          <Link href="/admin" className="flex min-h-12 items-center justify-center rounded-xl text-xs font-medium text-zinc-500">
            Admin
          </Link>
        ) : user ? (
          <Link href="/dashboard" className="flex min-h-12 items-center justify-center rounded-xl text-xs font-medium text-zinc-500">
            {t.nav.barberAccount}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => openAuth('signin')}
            className="flex min-h-12 items-center justify-center rounded-xl text-xs font-medium text-zinc-500"
          >
            {t.nav.barberAccount}
          </button>
        )}
      </nav>
    </footer>
  );
}
