'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Phone, MapPin, Clock, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const { lang, t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <main className="flex min-h-[calc(100vh-160px)] w-full items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-medium text-zinc-400">
            <span>{t.contact.badge}</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            {t.contact.title}
          </h1>
          <p className="mx-auto max-w-xl text-sm font-medium leading-relaxed text-zinc-400 sm:text-base">
            {t.contact.subtitle}
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contact Details Cards */}
          <div className="space-y-4 lg:col-span-1">
            
            {/* Phone & WhatsApp Card */}
            <div className="space-y-3 rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-xl shadow-black/20 backdrop-blur-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-300">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100">{t.contact.phone}</h3>
              <p className="text-xs font-medium text-zinc-400" dir="ltr">+90 536 251 58 78</p>
              <a
                href="https://wa.me/905362515878?text=Hello%20Al-Alamiah"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs font-medium text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>وتساب فوري / Direct WhatsApp</span>
              </a>
            </div>

            {/* Address Card */}
            <div className="space-y-3 rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-xl shadow-black/20 backdrop-blur-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-300">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100">{t.contact.address}</h3>
              <p className="text-xs font-medium leading-relaxed text-zinc-400">
                {t.contact.addressVal}
              </p>
            </div>

            {/* Hours Card */}
            <div className="space-y-3 rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-xl shadow-black/20 backdrop-blur-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-300">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100">{t.contact.hours}</h3>
              <p className="text-xs font-medium text-zinc-400">
                {t.contact.hoursVal}
              </p>
            </div>

          </div>

          {/* Contact Form */}
          <div className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-10 lg:col-span-2">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
              {t.contact.formTitle}
            </h2>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-400/50 text-emerald-200 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-300" />
                <p className="font-extrabold text-sm">{t.contact.sentSuccess}</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="min-h-11 rounded-xl bg-amber-400 px-4 text-xs font-semibold text-zinc-950 transition hover:bg-amber-300"
                >
                  إرسال رسالة أخرى
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                      {t.contact.nameLabel}
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="min-h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-white/25"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                      {t.contact.phoneLabel}
                    </label>
                    <input
                      type="tel"
                      required
                      dir="ltr"
                      placeholder="+90 5XX XXX XX XX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="min-h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-left text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-white/25"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                    {t.contact.emailLabel}
                  </label>
                  <input
                    type="email"
                    required
                    dir="ltr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="min-h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-left text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-white/25"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                    {t.contact.msgLabel}
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-white/25"
                  />
                </div>

                <button
                  type="submit"
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 text-sm font-semibold tracking-wide text-zinc-950 transition hover:bg-amber-300"
                >
                  <Send className="w-4 h-4" />
                  <span>{t.contact.sendBtn}</span>
                </button>
              </form>
            )}

          </div>

        </div>

      </div>
    </main>
  );
}
