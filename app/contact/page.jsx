'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Phone, Mail, MapPin, Clock, MessageSquare, Send, CheckCircle2, Crown, Sparkles } from 'lucide-react';

export default function ContactPage() {
  const { lang, t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('00905362515878');
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
    <div className="relative min-h-[calc(100vh-160px)] w-full py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      {/* Pi Network Style Glowing Ambient Orbs */}
      <div className="absolute top-1/4 -left-40 w-[500px] h-[500px] bg-purple-600/25 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-[160px] pointer-events-none" />

      <div className="relative w-full max-w-5xl space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-900/90 to-[#2A0E4E] border border-amber-400/50 text-amber-300 text-xs font-extrabold shadow-[0_0_15px_rgba(250,204,21,0.25)]">
            <Crown className="w-4 h-4 text-amber-300" />
            <span>{t.contact.badge}</span>
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-amber-300 to-yellow-500 drop-shadow-[0_2px_10px_rgba(234,179,8,0.3)]">
              {t.contact.title}
            </span>
          </h1>
          <p className="text-sm sm:text-base text-purple-200/80 max-w-xl mx-auto leading-relaxed font-medium">
            {t.contact.subtitle}
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contact Details Cards */}
          <div className="space-y-4 lg:col-span-1">
            
            {/* Phone & WhatsApp Card */}
            <div className="p-6 rounded-3xl backdrop-blur-2xl bg-[#17092F]/85 border-2 border-amber-400/30 shadow-[0_15px_40px_rgba(10,2,22,0.8)] space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/15 border border-amber-400/40 text-amber-300 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-yellow-100">{t.contact.phone}</h3>
              <p className="text-xs text-purple-200 font-semibold" dir="ltr">+90 536 251 58 78</p>
              <a
                href="https://wa.me/905362515878?text=Hello%20Al-Alamiah"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#25D366]/20 border border-[#25D366]/50 text-[#25D366] text-xs font-bold hover:bg-[#25D366]/30 transition-all shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>وتساب فوري / Direct WhatsApp</span>
              </a>
            </div>

            {/* Address Card */}
            <div className="p-6 rounded-3xl backdrop-blur-2xl bg-[#17092F]/85 border-2 border-amber-400/30 shadow-[0_15px_40px_rgba(10,2,22,0.8)] space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/15 border border-amber-400/40 text-amber-300 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-yellow-100">{t.contact.address}</h3>
              <p className="text-xs text-purple-200/80 leading-relaxed font-medium">
                {t.contact.addressVal}
              </p>
            </div>

            {/* Hours Card */}
            <div className="p-6 rounded-3xl backdrop-blur-2xl bg-[#17092F]/85 border-2 border-amber-400/30 shadow-[0_15px_40px_rgba(10,2,22,0.8)] space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/15 border border-amber-400/40 text-amber-300 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-yellow-100">{t.contact.hours}</h3>
              <p className="text-xs text-purple-200/80 font-medium">
                {t.contact.hoursVal}
              </p>
            </div>

          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 p-6 sm:p-10 rounded-3xl backdrop-blur-3xl bg-[#17092F]/90 border-2 border-amber-400/35 shadow-[0_25px_60px_rgba(10,2,22,0.9)] space-y-6">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 to-amber-300">
                {t.contact.formTitle}
              </span>
            </h2>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-400/50 text-emerald-200 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-300" />
                <p className="font-extrabold text-sm">{t.contact.sentSuccess}</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 text-xs font-black text-purple-950 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-xl hover:brightness-110 transition-all shadow-sm"
                >
                  إرسال رسالة أخرى
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-amber-300 font-bold">
                      {t.contact.nameLabel}
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#200B3E] border border-amber-400/30 rounded-2xl px-4 py-3 text-sm text-yellow-100 placeholder:text-purple-400/60 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-amber-300 font-bold">
                      {t.contact.phoneLabel}
                    </label>
                    <input
                      type="tel"
                      required
                      dir="ltr"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#200B3E] border border-amber-400/30 rounded-2xl px-4 py-3 text-sm text-yellow-100 placeholder:text-purple-400/60 focus:outline-none focus:border-amber-400 text-left"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-amber-300 font-bold">
                    {t.contact.emailLabel}
                  </label>
                  <input
                    type="email"
                    required
                    dir="ltr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#200B3E] border border-amber-400/30 rounded-2xl px-4 py-3 text-sm text-yellow-100 placeholder:text-purple-400/60 focus:outline-none focus:border-amber-400 text-left"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-amber-300 font-bold">
                    {t.contact.msgLabel}
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-[#200B3E] border border-amber-400/30 rounded-2xl px-4 py-3 text-sm text-yellow-100 placeholder:text-purple-400/60 focus:outline-none focus:border-amber-400 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-purple-950 font-black text-sm tracking-wide shadow-[0_10px_35px_rgba(250,204,21,0.4)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{t.contact.sendBtn}</span>
                </button>
              </form>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
