'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LockKeyhole, Mail, Scissors, UserRound } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';

export default function AuthPage() {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const [mode, setMode] = useState('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const isSignup = mode === 'signup';
  const handleSubmit = async (event) => {
    event.preventDefault();
    setPending(true);
    setFeedback(null);

    try {
      const requestedPath = new URLSearchParams(window.location.search).get('next');
      const returnTo = requestedPath && requestedPath.startsWith('/') && !requestedPath.startsWith('//')
        ? requestedPath
        : '/';

      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { account_type: 'customer', full_name: name.trim() },
          },
        });

        if (error) throw error;

        if (!data.session) {
          setFeedback({
            type: 'success',
            text: lang === 'ar'
              ? 'تم إنشاء الحساب. تحقق من بريدك الإلكتروني لتأكيده، ثم سجّل الدخول.'
              : lang === 'tr'
                ? 'Hesabınız oluşturuldu. E-postanızı doğrulayın, ardından giriş yapın.'
                : 'Account created. Check your email to confirm it, then sign in.',
          });
          return;
        }

        router.replace(returnTo);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      const { data: accountRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (roleError) {
        await supabase.auth.signOut();
        throw roleError;
      }

      if (accountRole?.role === 'barber') {
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) throw signOutError;
        setFeedback({
          type: 'error',
          text: lang === 'ar'
            ? 'هذا الحساب مخصص للحلاقين. استخدم مدخل الحلاقين.'
            : lang === 'tr'
              ? 'Bu hesap berberler içindir. Lütfen berber girişini kullanın.'
              : 'This account is for barbers. Please use the barber sign-in.',
        });
        return;
      }

      router.replace(accountRole?.role === 'admin' && returnTo === '/' ? '/admin' : returnTo);
    } catch (error) {
      setFeedback({ type: 'error', text: error.message || t.systemError });
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-amber-400">
            <Scissors className="h-5 w-5" />
          </div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
            {lang === 'ar' ? 'حساب العميل' : lang === 'tr' ? 'Müşteri hesabı' : 'Customer account'}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            {isSignup
              ? (lang === 'ar' ? 'إنشاء حساب' : lang === 'tr' ? 'Hesap oluştur' : 'Create your account')
              : t.nav.signIn}
          </h1>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {lang === 'ar'
              ? 'سجّل الدخول أو أنشئ حساباً لمتابعة حجز موعدك.'
              : lang === 'tr'
                ? 'Randevu işleminize devam etmek için giriş yapın veya hesap oluşturun.'
                : 'Sign in or create an account to continue with your appointment.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <AuthField
              icon={UserRound}
              label={lang === 'ar' ? 'الاسم الكامل' : lang === 'tr' ? 'Ad Soyad' : 'Full name'}
              type="text"
              value={name}
              onChange={setName}
              required
              autoComplete="name"
            />
          )}
          <AuthField
            icon={Mail}
            label={t.auth.email}
            type="email"
            value={email}
            onChange={setEmail}
            required
            autoComplete="email"
          />
          <AuthField
            icon={LockKeyhole}
            label={t.auth.password}
            type="password"
            value={password}
            onChange={setPassword}
            required
            minLength={6}
            autoComplete={isSignup ? 'new-password' : 'current-password'}
          />

          {feedback && (
            <p
              role="status"
              className={`rounded-xl border p-3 text-sm ${
                feedback.type === 'error'
                  ? 'border-rose-400/20 bg-rose-400/5 text-rose-200'
                  : 'border-emerald-400/20 bg-emerald-400/5 text-emerald-200'
              }`}
            >
              {feedback.text}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="min-h-12 w-full rounded-xl bg-amber-400 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300 disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? '...' : isSignup ? t.nav.signUp : t.nav.signIn}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          {isSignup
            ? (lang === 'ar' ? 'لديك حساب بالفعل؟' : lang === 'tr' ? 'Zaten hesabınız var mı?' : 'Already have an account?')
            : (lang === 'ar' ? 'ليس لديك حساب؟' : lang === 'tr' ? 'Hesabınız yok mu?' : 'New to the shop?')}
          {' '}
          <button
            type="button"
            onClick={() => {
              setFeedback(null);
              setMode(isSignup ? 'signin' : 'signup');
            }}
            className="min-h-11 font-medium text-amber-300 hover:text-amber-200"
          >
            {isSignup ? t.nav.signIn : t.nav.signUp}
          </button>
        </p>
        <Link href="/" className="mt-2 flex min-h-11 items-center justify-center text-sm text-zinc-500 hover:text-zinc-300">
          {lang === 'ar' ? 'العودة للحجز' : lang === 'tr' ? 'Randevuya dön' : 'Back to booking'}
        </Link>
      </section>
    </main>
  );
}

function AuthField({ icon: Icon, label, type, value, onChange, required, minLength, autoComplete }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-zinc-300">{label}</span>
      <span className="relative block">
        <Icon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          className="min-h-12 w-full rounded-xl border border-white/10 bg-black/20 pl-10 pr-4 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-white/25"
        />
      </span>
    </label>
  );
}
