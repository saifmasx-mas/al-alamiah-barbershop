'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';
import { X, Mail, Lock, User, Crown, Sparkles, Phone, MapPin, MapPinned } from 'lucide-react';

const defaultWorkingHours = {
  start: '09:30',
  end: '22:00',
  lunch_start: '13:30',
  lunch_end: '14:30',
  days_off: [0],
};

export default function AuthModal() {
  const { isAuthOpen, closeAuth, authMode, setAuthMode, t, loginUser } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!isAuthOpen) return null;

  const saveBarberProfile = async (authUser, profile) => {
    const { data, error } = await supabase
      .from('barbers')
      .insert({
        auth_user_id: authUser.id,
        name: profile.full_name,
        phone: profile.phone,
        address: profile.address,
        map_url: profile.map_url,
        working_hours: defaultWorkingHours,
      })
      .select()
      .single();

    return { data, error };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      if (authMode === 'signup') {
        let parsedMapUrl;
        try {
          parsedMapUrl = new URL(mapUrl);
        } catch {
          setFeedback({ type: 'error', text: t.auth.mapError });
          return;
        }

        if (parsedMapUrl.protocol !== 'http:' && parsedMapUrl.protocol !== 'https:') {
          setFeedback({ type: 'error', text: t.auth.mapError });
          return;
        }

        const profile = {
          full_name: fullName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          map_url: parsedMapUrl.href,
        };
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { account_type: 'barber', ...profile } },
        });

        if (error) {
          setFeedback({ type: 'error', text: error.message });
          return;
        }

        if (!data.session || !data.user) {
          setFeedback({ type: 'success', text: t.auth.confirmEmail });
          return;
        }

        const { data: barber, error: profileError } = await saveBarberProfile(data.user, profile);
        if (profileError) {
          setFeedback({ type: 'error', text: `${t.auth.profileError} ${profileError.message}` });
          return;
        }

        loginUser(barber);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setFeedback({ type: 'error', text: error.message });
        return;
      }

      const { data: barber, error: lookupError } = await supabase
        .from('barbers')
        .select('*')
        .eq('auth_user_id', data.user.id)
        .maybeSingle();

      if (lookupError) {
        setFeedback({ type: 'error', text: lookupError.message });
        return;
      }

      let profile = barber;
      if (!profile && data.user.user_metadata?.account_type === 'barber') {
        const metadata = data.user.user_metadata;
        const savedProfile = await saveBarberProfile(data.user, {
          full_name: metadata.full_name,
          phone: metadata.phone,
          address: metadata.address,
          map_url: metadata.map_url,
        });

        if (savedProfile.error) {
          setFeedback({ type: 'error', text: `${t.auth.profileError} ${savedProfile.error.message}` });
          return;
        }
        profile = savedProfile.data;
      }

      if (!profile) {
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) console.error('Unable to sign out non-barber account:', signOutError.message);
        setFeedback({ type: 'error', text: t.auth.barberOnly });
        return;
      }

      loginUser(profile);
    } catch (error) {
      setFeedback({ type: 'error', text: error.message || t.systemError });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl transition-opacity">
      <div className="absolute w-96 h-96 bg-purple-600/25 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute w-80 h-80 bg-amber-500/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto backdrop-blur-3xl bg-[#17092F]/95 border-2 border-amber-400/35 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(10,2,22,0.95)]">
        <button
          type="button"
          onClick={closeAuth}
          className="absolute top-5 ltr:right-5 rtl:left-5 text-purple-300 hover:text-white p-2 rounded-xl hover:bg-purple-900/40 transition-colors"
          aria-label={t.auth.close}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-900/60 border border-amber-400/40 text-amber-300 text-xs font-bold shadow-sm">
            <Crown className="w-3.5 h-3.5 text-yellow-300" />
            <span>{t.nav.barberAccount}</span>
          </div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-amber-300 to-yellow-500 tracking-tight">
            {authMode === 'signin' ? t.auth.signInTitle : t.auth.signUpTitle}
          </h2>
          <p className="text-xs text-purple-200/80 leading-relaxed max-w-xs mx-auto font-medium">
            {t.auth.subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'signup' && (
            <>
              <InputField
                icon={User}
                label={t.auth.fullName}
                value={fullName}
                onChange={setFullName}
                placeholder={t.auth.fullNamePlaceholder}
                required
              />
              <InputField
                icon={Phone}
                label={t.auth.phone}
                value={phone}
                onChange={setPhone}
                placeholder={t.auth.phonePlaceholder}
                type="tel"
                required
              />
              <InputField
                icon={MapPin}
                label={t.auth.address}
                value={address}
                onChange={setAddress}
                placeholder={t.auth.addressPlaceholder}
                required
              />
              <InputField
                icon={MapPinned}
                label={t.auth.mapLocation}
                value={mapUrl}
                onChange={setMapUrl}
                placeholder={t.auth.mapPlaceholder}
                type="url"
                dir="ltr"
                required
              />
            </>
          )}

          <InputField
            icon={Mail}
            label={t.auth.email}
            value={email}
            onChange={setEmail}
            placeholder={t.auth.emailPlaceholder}
            type="email"
            dir="ltr"
            required
          />
          <InputField
            icon={Lock}
            label={t.auth.password}
            value={password}
            onChange={setPassword}
            placeholder={t.auth.passwordPlaceholder}
            type="password"
            dir="ltr"
            required
            minLength={6}
          />

          {feedback && (
            <div
              role="status"
              className={`p-3 rounded-xl text-xs font-bold border ${
                feedback.type === 'error'
                  ? 'bg-rose-950/60 border-rose-500/50 text-rose-200'
                  : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
              }`}
            >
              {feedback.text}
            </div>
          )}

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

        <div className="mt-5 text-center text-xs text-purple-200/80 font-medium">
          {authMode === 'signin' ? (
            <>
              {t.auth.noAccount}{' '}
              <button
                type="button"
                onClick={() => {
                  setFeedback(null);
                  setAuthMode('signup');
                }}
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
                onClick={() => {
                  setFeedback(null);
                  setAuthMode('signin');
                }}
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

function InputField({ icon: Icon, label, value, onChange, placeholder, type = 'text', dir, required, minLength }) {
  return (
    <div className="space-y-1">
      <label className="text-xs uppercase tracking-wider text-amber-300 font-bold">{label}</label>
      <div className="relative">
        <Icon className="w-4 h-4 text-amber-400 absolute top-3.5 ltr:left-3.5 rtl:right-3.5" />
        <input
          type={type}
          required={required}
          minLength={minLength}
          dir={dir}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full bg-[#200B3E] border border-amber-400/25 rounded-xl py-2.5 ltr:pl-10 ltr:pr-4 rtl:pr-10 rtl:pl-4 text-sm text-yellow-100 placeholder:text-purple-400/60 focus:outline-none focus:border-amber-400 ${
            dir === 'ltr' ? 'text-left' : ''
          }`}
        />
      </div>
    </div>
  );
}
