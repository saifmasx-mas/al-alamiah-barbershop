'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Scissors, Phone, MapPin, Clock, MessageSquare, Sparkles } from 'lucide-react';

export default function Footer() {
  const { lang, t } = useLanguage();

  return (
    <footer className="w-full bg-[#100422] border-t-2 border-amber-400/25 text-purple-200/80 text-sm mt-auto relative overflow-hidden shadow-[0_-15px_40px_rgba(10,2,22,0.9)]">
      {/* Background glow in cosmic purple and gold */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-40 bg-purple-700/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-0 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-300 p-0.5 shadow-[0_0_20px_rgba(250,204,21,0.35)]">
                <div className="w-full h-full bg-[#180A2F] rounded-[10px] flex items-center justify-center text-amber-300">
                  <Scissors className="w-5 h-5 -rotate-45" />
                </div>
              </div>
              <span className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-400">
                {lang === 'ar' ? 'العالمية للحلاقة' : lang === 'tr' ? 'Uluslararası Berber' : 'Al-Alamiah Barbershop'}
              </span>
            </div>
            <p className="text-xs text-purple-200/70 leading-relaxed max-w-md font-medium">
              {t.footer.desc}
            </p>
            
            {/* Quick WhatsApp button in footer */}
            <a
              href="https://wa.me/905362515878?text=Hello%20Al-Alamiah%20Barbershop"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#25D366]/20 to-[#25D366]/10 border border-[#25D366]/50 text-[#25D366] text-xs font-bold hover:bg-[#25D366]/30 transition-all shadow-[0_0_15px_rgba(37,211,102,0.2)]"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t.footer.chatWhatsApp} (+90 536 251 58 78)</span>
            </a>
          </div>

          {/* Working Hours & Location */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-amber-300 font-extrabold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>{t.contact.hours}</span>
            </h4>
            <div className="flex items-start gap-2.5 text-xs text-purple-200 font-medium">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{t.contact.hoursVal}</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-purple-200 font-medium">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{t.contact.addressVal}</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-purple-200 font-medium">
              <Phone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span dir="ltr">+90 536 251 58 78</span>
            </div>
          </div>

          {/* Social Media Links in Gold & Purple */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-wider text-amber-300 font-extrabold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>{t.footer.socialsTitle}</span>
            </h4>
            <p className="text-xs text-purple-300/80 font-medium">
              تواصل وتفاعل معنا عبر منصاتنا الرسمية:
            </p>
            <div className="flex items-center gap-2.5 flex-wrap">
              
              {/* WhatsApp */}
              <a
                href="https://wa.me/905362515878"
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp / وتساب"
                className="w-10 h-10 rounded-xl bg-[#200B3E] hover:bg-[#25D366]/20 border border-amber-400/30 hover:border-[#25D366] flex items-center justify-center text-purple-200 hover:text-[#25D366] transition-all hover:scale-110 shadow-sm"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.159.57 4.185 1.564 5.938l-1.664 6.082 6.242-1.636c1.7 1.002 3.684 1.579 5.858 1.579 6.627 0 12-5.373 12-12s-5.373-12-12-12z" />
                </svg>
              </a>

              {/* Telegram */}
              <a
                href="https://t.me/alalamiah_barber"
                target="_blank"
                rel="noopener noreferrer"
                title="Telegram / تلغرام"
                className="w-10 h-10 rounded-xl bg-[#200B3E] hover:bg-[#229ED9]/20 border border-amber-400/30 hover:border-[#229ED9] flex items-center justify-center text-purple-200 hover:text-[#229ED9] transition-all hover:scale-110 shadow-sm"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.536-.196 1.006.128.832.941z" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com/alalamiah.barbershop"
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook / فيسبوك"
                className="w-10 h-10 rounded-xl bg-[#200B3E] hover:bg-[#1877F2]/20 border border-amber-400/30 hover:border-[#1877F2] flex items-center justify-center text-purple-200 hover:text-[#1877F2] transition-all hover:scale-110 shadow-sm"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
              </a>

              {/* X */}
              <a
                href="https://x.com/alalamiah_barber"
                target="_blank"
                rel="noopener noreferrer"
                title="X / إكس"
                className="w-10 h-10 rounded-xl bg-[#200B3E] hover:bg-yellow-400/20 border border-amber-400/30 hover:border-amber-400 flex items-center justify-center text-purple-200 hover:text-amber-300 transition-all hover:scale-110 shadow-sm"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Links */}
        <div className="border-t border-purple-500/20 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-purple-300/60 font-medium">
          <p>{t.footer.rights}</p>
          <div className="flex items-center gap-4">
            <Link href="/contact" className="hover:text-amber-300 transition-colors">
              {t.nav.contact}
            </Link>
            <span>•</span>
            <span className="hover:text-amber-300 transition-colors cursor-pointer">
              {t.footer.privacy}
            </span>
            <span>•</span>
            <span className="hover:text-amber-300 transition-colors cursor-pointer">
              {t.footer.terms}
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
