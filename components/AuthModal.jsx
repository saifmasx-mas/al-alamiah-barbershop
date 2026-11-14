'use client';

import { useState } from 'react';
import { LockKeyhole, Mail, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';

export default function AuthModal() {
  const { isAuthOpen, closeAuth, t, loginUser } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  if (!isAuthOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setFeedback('');

    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) throw signInError;

      const [{ data: role, error: roleError }, { data: profile, error: profileError }] = await Promise.all([
        supabase.from('user_roles').select('role').eq('user_id', signInData.user.id).maybeSingle(),
        supabase.from('barbers').select('*').eq('auth_user_id', signInData.user.id).maybeSingle(),
      ]);

      if (roleError || profileError) {
        await supabase.auth.signOut();
        throw roleError || profileError;
      }

      if (role?.role !== 'barber' || !profile) {
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) throw signOutError;
        setFeedback(t.auth.barberOnly);
        return;
      }

      loginUser(profile);
    } catch (error) {
      setFeedback(error.message || t.systemError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <section className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#200040]/95 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
        <button
          type="button"
          onClick={closeAuth}
          aria-label={t.auth.close}
          className="absolute right-4 top-4 flex min-h-11 min-w-11 items-center justify-center rounded-xl text-zinc-400 hover:bg-white/5 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 space-y-2 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">{t.nav.barberAccount}</p>
          <h2 className="text-2xl font-semibold text-white">{t.auth.signInTitle}</h2>
          <p className="mx-auto max-w-xs text-sm leading-6 text-zinc-400">{t.auth.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthField
            icon={Mail}
            label={t.auth.email}
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
          />
          <AuthField
            icon={LockKeyhole}
            label={t.auth.password}
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
          />
          {feedback && (
            <p role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-3 text-sm text-rose-200">
              {feedback}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="min-h-12 w-full rounded-xl bg-amber-400 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300 disabled:opacity-50"
          >
            {loading ? '…' : t.auth.submitSignIn}
          </button>
        </form>
      </section>
    </div>
  );
}

function AuthField({ icon: Icon, label, type, value, onChange, autoComplete }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-zinc-300">{label}</span>
      <span className="relative block">
        <Icon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
        <input
          type={type}
          required
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-12 w-full rounded-xl border border-white/10 bg-black/20 pl-10 pr-4 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-white/25"
        />
      </span>
    </label>
  );
}
