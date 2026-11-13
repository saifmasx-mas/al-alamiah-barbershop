'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, Users } from 'lucide-react';
import { onboardBarber } from '@/app/actions/admin';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';

const emptyBarber = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  mapUrl: '',
  bufferMinutes: '10',
};

export default function AdminDashboard() {
  const { authUser, appRole } = useLanguage();
  const router = useRouter();
  const [barbers, setBarbers] = useState([]);
  const [edits, setEdits] = useState({});
  const [form, setForm] = useState(emptyBarber);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingId, setSavingId] = useState('');
  const [access, setAccess] = useState('checking');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (!active) return;
      if (sessionError) {
        setError(sessionError.message);
        setLoading(false);
        return;
      }
      if (!sessionData.session) {
        router.replace(`/auth?next=${encodeURIComponent('/admin')}`);
        return;
      }

      const { data: role, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', sessionData.session.user.id)
        .maybeSingle();

      if (!active) return;
      if (roleError) {
        setError(roleError.message);
        setAccess('denied');
        setLoading(false);
        return;
      }
      if (role?.role !== 'admin') {
        setAccess('denied');
        setLoading(false);
        return;
      }

      setAccess('allowed');
      const { data, error: barbersError } = await supabase
        .from('barbers')
        .select('id, name, phone, address, map_url, buffer_minutes, auth_user_id')
        .order('name');

      if (!active) return;
      if (barbersError) {
        setError(barbersError.message);
      } else {
        const rows = data || [];
        setBarbers(rows);
        setEdits(Object.fromEntries(rows.map((barber) => [
          barber.id,
          {
            name: barber.name || '',
            phone: barber.phone || '',
            address: barber.address || '',
            mapUrl: barber.map_url || '',
            bufferMinutes: String(barber.buffer_minutes ?? 10),
          },
        ])));
      }
      setLoading(false);
    };

    initialize().catch((loadError) => {
      if (active) {
        setError(loadError.message || 'Unable to load the admin dashboard.');
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [router, authUser, appRole]);

  const submitNewBarber = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setNotice('');

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      setSubmitting(false);
      setError(sessionError?.message || 'Your session expired. Sign in again.');
      return;
    }

    const result = await onboardBarber(form, sessionData.session.access_token);
    setSubmitting(false);
    if (!result.success) {
      setError(result.error);
      return;
    }

    const newBarber = result.barber;
    setBarbers((current) => [...current, newBarber].sort((a, b) => a.name.localeCompare(b.name)));
    setEdits((current) => ({
      ...current,
      [newBarber.id]: {
        name: newBarber.name,
        phone: newBarber.phone || '',
        address: newBarber.address || '',
        mapUrl: newBarber.map_url || '',
        bufferMinutes: String(newBarber.buffer_minutes),
      },
    }));
    setForm(emptyBarber);
    setNotice(`Invitation sent to ${form.email.trim()}.`);
  };

  const saveBarber = async (barberId) => {
    const edit = edits[barberId];
    const bufferMinutes = Number(edit?.bufferMinutes);
    if (!edit?.name.trim() || !Number.isInteger(bufferMinutes) || bufferMinutes < 0 || bufferMinutes > 180) {
      setError('Enter a barber name and a buffer between 0 and 180 minutes.');
      return;
    }

    if (edit.mapUrl) {
      try {
        if (!['http:', 'https:'].includes(new URL(edit.mapUrl).protocol)) throw new Error();
      } catch {
        setError('The map URL must start with http:// or https://.');
        return;
      }
    }

    setSavingId(barberId);
    setError('');
    setNotice('');
    const { data, error: updateError } = await supabase
      .from('barbers')
      .update({
        name: edit.name.trim(),
        phone: edit.phone.trim() || null,
        address: edit.address.trim() || null,
        map_url: edit.mapUrl.trim() || null,
        buffer_minutes: bufferMinutes,
      })
      .eq('id', barberId)
      .select('id, name, phone, address, map_url, buffer_minutes, auth_user_id')
      .single();
    setSavingId('');

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setBarbers((current) => current.map((barber) => barber.id === barberId ? data : barber));
    setNotice('Barber profile saved.');
  };

  if (loading) {
    return <main className="flex flex-1 items-center justify-center px-4 py-16 text-sm text-zinc-400">Checking admin access…</main>;
  }

  if (access !== 'allowed') {
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center backdrop-blur-xl">
          <p role={error ? 'alert' : undefined} className="text-sm text-zinc-300">
            {error || 'This area is restricted to the platform administrator.'}
          </p>
          <Link href="/" className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-white/10 px-4 text-sm text-white">
            Return to booking
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-4 py-8 pb-24 sm:px-6 sm:pb-8">
      <header className="flex items-end gap-3">
        <Users className="mb-1 h-5 w-5 text-zinc-400" />
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Platform administration</p>
          <h1 className="mt-1 text-2xl font-semibold text-white">Barber accounts</h1>
        </div>
      </header>

      {error && <p role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-3 text-sm text-rose-200">{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3 text-sm text-emerald-200">{notice}</p>}

      <section className="space-y-5 rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-xl shadow-black/20 backdrop-blur-xl sm:p-7">
        <div className="flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-zinc-400" />
          <h2 className="text-lg font-medium text-white">Onboard a barber</h2>
        </div>
        <p className="text-sm leading-6 text-zinc-400">
          The barber will receive a Supabase invitation at their email address. Their account is assigned the barber role.
        </p>
        <form onSubmit={submitNewBarber} className="grid gap-4 sm:grid-cols-2">
          <AdminField label="Full name" value={form.fullName} onChange={(value) => setForm((current) => ({ ...current, fullName: value }))} required />
          <AdminField label="Email" type="email" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} required />
          <AdminField label="Phone" type="tel" value={form.phone} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} />
          <AdminField label="Address" value={form.address} onChange={(value) => setForm((current) => ({ ...current, address: value }))} />
          <AdminField label="Map URL" type="url" value={form.mapUrl} onChange={(value) => setForm((current) => ({ ...current, mapUrl: value }))} />
          <AdminField label="Buffer (minutes)" type="number" value={form.bufferMinutes} onChange={(value) => setForm((current) => ({ ...current, bufferMinutes: value }))} min="0" max="180" />
          <div className="sm:col-span-2">
            <button type="submit" disabled={submitting} className="min-h-12 w-full rounded-xl bg-amber-400 px-5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300 disabled:opacity-50 sm:w-auto">
              {submitting ? 'Sending invitation…' : 'Create barber account'}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium text-white">Existing barbers</h2>
        {barbers.length ? barbers.map((barber) => {
          const edit = edits[barber.id] || {};
          return (
            <article key={barber.id} className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-lg shadow-black/10 backdrop-blur-xl sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-medium text-zinc-100">{barber.name}</h3>
                <span className="text-xs text-zinc-500">{barber.auth_user_id ? 'Account linked' : 'No account linked'}</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminField label="Full name" value={edit.name || ''} onChange={(value) => setEdits((current) => ({ ...current, [barber.id]: { ...current[barber.id], name: value } }))} />
                <AdminField label="Phone" type="tel" value={edit.phone || ''} onChange={(value) => setEdits((current) => ({ ...current, [barber.id]: { ...current[barber.id], phone: value } }))} />
                <AdminField label="Address" value={edit.address || ''} onChange={(value) => setEdits((current) => ({ ...current, [barber.id]: { ...current[barber.id], address: value } }))} />
                <AdminField label="Map URL" type="url" value={edit.mapUrl || ''} onChange={(value) => setEdits((current) => ({ ...current, [barber.id]: { ...current[barber.id], mapUrl: value } }))} />
                <AdminField label="Buffer (minutes)" type="number" min="0" max="180" value={edit.bufferMinutes || '0'} onChange={(value) => setEdits((current) => ({ ...current, [barber.id]: { ...current[barber.id], bufferMinutes: value } }))} />
              </div>
              <button type="button" onClick={() => saveBarber(barber.id)} disabled={savingId === barber.id} className="min-h-11 rounded-xl bg-amber-400 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300 disabled:opacity-50">
                {savingId === barber.id ? 'Saving…' : 'Save changes'}
              </button>
            </article>
          );
        }) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-zinc-500">No barber profiles yet.</div>
        )}
      </section>
    </main>
  );
}

function AdminField({ label, value, onChange, type = 'text', required = false, min, max }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-zinc-300">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        min={min}
        max={max}
        className="min-h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-white/25"
      />
    </label>
  );
}
