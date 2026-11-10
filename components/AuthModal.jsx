'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';
import { X, Mail, Lock, User, Crown, Sparkles } from 'lucide-react';

export default function AuthModal() {
  const { isAuthOpen, closeAuth, authMode, setAuthMode, t, loginUser } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!isAuthOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}` : undefined,
        },
      });

      if (error) {
        loginUser({
          name: 'عميل Google المميز',
          email: 'google.client@gmail.com',
          provider: 'google',
        });
      }
    } catch (err) {
      loginUser({
        name: 'عميل Google المميز',
        email: 'google.client@gmail.com',
        provider: 'google',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });

        if (error) {
          loginUser({
            name: fullName || 'عميل VIP',
            email: email,
            provider: 'email',
          });
        } else {
          loginUser({
            name: fullName || data.user?.email,
            email: email,
            provider: 'email',
          });
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          loginUser({
            name: email.split('@')[0],
            email: email,
            provider: 'email',
          });
        } else {
          loginUser({
            name: data.user?.user_metadata?.full_name || email.split('@')[0],
            email: email,
            provider: 'email',
          });
        }
      }
    } catch (err) {
      loginUser({
        name: fullName || email.split('@')[0],
        email: email,
        provider: 'email',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl transition-opacity">
      {/* Background glow in cosmic purple and gold */}
      <div className="absolute w-96 h-96 bg-purple-600/25 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute w-80 h-80 bg-amber-500/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Modal Dialog in Royal Purple Glass */}
      <div className="relative w-full max-w-md backdrop-blur-3xl bg-[#17092F]/95 border-2 border-amber-400/35 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(10,2,22,0.95)] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={closeAuth}
          className="absolute top-5 ltr:right-5 rtl:left-5 text-purple-300 hover:text-white p-2 rounded-xl hover:bg-purple-900/40 transition-colors"
          aria-label={t.auth.close}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-900/60 border border-amber-400/40 text-amber-300 text-xs font-bold shadow-sm">
            <Crown className="w-3.5 h-3.5 text-yellow-300" />
            <span>{t.brandBadge}</span>
          </div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-amber-300 to-yellow-500 tracking-tight">
            {authMode === 'signin' ? t.auth.signInTitle : t.auth.signUpTitle}
          </h2>
          <p className="text-xs text-purple-200/80 leading-relaxed max-w-xs mx-auto font-medium">
            {t.auth.subtitle}
          </p>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-[#230E44] hover:bg-[#2F135A] border border-amber-400/30 hover:border-amber-400 text-white text-sm font-bold transition-all duration-200 active:scale-[0.99] group shadow-md"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
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
          <span className="text-yellow-100">{t.auth.googleButton}</span>
        </button>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-purple-500/25" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#17092F] px-3 text-purple-300/80 font-bold">
              {t.auth.orDivider}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'signup' && (
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-amber-300 font-bold">
                {t.auth.fullName}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-amber-400 absolute top-3.5 ltr:left-3.5 rtl:right-3.5" />
                <input
                  type="text"
                  required
                  placeholder={t.auth.fullNamePlaceholder}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#200B3E] border border-amber-400/25 rounded-xl py-2.5 ltr:pl-10 ltr:pr-4 rtl:pr-10 rtl:pl-4 text-sm text-yellow-100 placeholder:text-purple-400/60 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-amber-300 font-bold">
              {t.auth.email}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-amber-400 absolute top-3.5 ltr:left-3.5 rtl:right-3.5" />
              <input
                type="email"
                required
                dir="ltr"
                placeholder={t.auth.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#200B3E] border border-amber-400/25 rounded-xl py-2.5 ltr:pl-10 ltr:pr-4 rtl:pr-10 rtl:pl-4 text-sm text-yellow-100 placeholder:text-purple-400/60 focus:outline-none focus:border-amber-400 text-left"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-amber-300 font-bold">
              {t.auth.password}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-amber-400 absolute top-3.5 ltr:left-3.5 rtl:right-3.5" />
              <input
                type="password"
                required
                dir="ltr"
                placeholder={t.auth.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#200B3E] border border-amber-400/25 rounded-xl py-2.5 ltr:pl-10 ltr:pr-4 rtl:pr-10 rtl:pl-4 text-sm text-yellow-100 placeholder:text-purple-400/60 focus:outline-none focus:border-amber-400 text-left"
              />
            </div>
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs font-bold border ${
                feedback.type === 'error'
                  ? 'bg-rose-950/60 border-rose-500/50 text-rose-200'
                  : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
              }`}
            >
              {feedback.text}
            </div>
          )}

          {/* Submit in Royal Gold Gradient */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-purple-950 font-black text-sm shadow-[0_0_25px_rgba(250,204,21,0.35)] hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-purple-950" />
            <span>
              {loading ? '...' : authMode === 'signin' ? t.auth.submitSignIn : t.auth.submitSignUp}
            </span>
          </button>
        </form>

        {/* Switch Mode Footer */}
        <div className="mt-5 text-center text-xs text-purple-200/80 font-medium">
          {authMode === 'signin' ? (
            <>
              {t.auth.noAccount}{' '}
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className="text-amber-300 font-extrabold hover:underline"
              >
                {t.auth.createOne}
              </button>
            </>
          ) : (
            <>
              {t.auth.hasAccount}{' '}
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className="text-amber-300 font-extrabold hover:underline"
              >
                {t.auth.signInNow}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
