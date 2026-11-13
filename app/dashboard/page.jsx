'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';
import { CalendarDays, Scissors } from 'lucide-react';

export default function BarberDashboard() {
  const { lang } = useLanguage();
  const router = useRouter();
  const [barber, setBarber] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [prices, setPrices] = useState({});
  const [savingService, setSavingService] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    let channel;

    const loadAppointments = async (barberId) => {
      const { data, error: queryError } = await supabase
        .from('appointments')
        .select('id, customer_name, customer_phone, appointment_datetime, status, price_at_booking, duration_minutes, service:services(name)')
        .eq('barber_id', barberId)
        .order('appointment_datetime', { ascending: true });

      if (!active) return;
      if (queryError) {
        setError(queryError.message);
        return;
      }
      setAppointments(data || []);
    };

    const initialize = async () => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (!active) return;
      if (sessionError) {
        setError(sessionError.message);
        setLoading(false);
        return;
      }
      if (!sessionData.session) {
        router.replace(`/auth?next=${encodeURIComponent('/dashboard')}`);
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
        setLoading(false);
        return;
      }
      if (role?.role !== 'barber') {
        setError(lang === 'ar'
          ? 'هذه الصفحة مخصصة لحسابات الحلاقين.'
          : lang === 'tr'
            ? 'Bu sayfa yalnızca berber hesaplarına açıktır.'
            : 'This page is available to barber accounts only.');
        setLoading(false);
        return;
      }

      const { data: barberProfile, error: profileError } = await supabase
        .from('barbers')
        .select('*')
        .eq('auth_user_id', sessionData.session.user.id)
        .maybeSingle();

      if (!active) return;
      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }
      if (!barberProfile) {
        setError('No barber profile is linked to this account.');
        setLoading(false);
        return;
      }

      setBarber(barberProfile);
      const [{ data: catalog, error: catalogError }, { data: customPrices, error: pricesError }] = await Promise.all([
        supabase.from('services').select('id, name, duration_minutes, price').order('name'),
        supabase.from('barber_services').select('service_id, price_override').eq('barber_id', barberProfile.id),
      ]);

      if (!active) return;
      if (catalogError || pricesError) {
        setError(catalogError?.message || pricesError.message);
        setLoading(false);
        return;
      }

      const customByService = new Map((customPrices || []).map((entry) => [entry.service_id, entry.price_override]));
      setServices(catalog || []);
      setPrices(Object.fromEntries((catalog || []).map((service) => [
        service.id,
        customByService.get(service.id) ?? service.price,
      ])));

      await loadAppointments(barberProfile.id);
      if (!active) return;

      channel = supabase
        .channel(`barber-appointments-${barberProfile.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'appointments',
            filter: `barber_id=eq.${barberProfile.id}`,
          },
          () => loadAppointments(barberProfile.id)
        )
        .subscribe((status, subscriptionError) => {
          if (subscriptionError && active) {
            setError(subscriptionError.message);
          } else if (status === 'CHANNEL_ERROR' && active) {
            setError('Live appointment updates could not be connected.');
          }
        });

      setLoading(false);
    };

    initialize().catch((loadError) => {
      if (active) {
        setError(loadError.message || 'Unable to load the barber dashboard.');
        setLoading(false);
      }
    });

    return () => {
      active = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [lang, router]);

  const savePrice = async (service) => {
    const price = Number(prices[service.id]);
    if (!Number.isFinite(price) || price < 0) {
      setError('Enter a valid non-negative price.');
      return;
    }

    setSavingService(service.id);
    setError('');
    setNotice('');
    const { error: saveError } = await supabase
      .from('barber_services')
      .upsert(
        { barber_id: barber.id, service_id: service.id, price_override: price },
        { onConflict: 'barber_id,service_id' }
      );
    setSavingService('');

    if (saveError) {
      setError(saveError.message);
      return;
    }
    setNotice(lang === 'ar' ? 'تم حفظ السعر.' : lang === 'tr' ? 'Fiyat kaydedildi.' : 'Price saved.');
  };

  if (loading) {
    return <main className="flex flex-1 items-center justify-center px-4 py-16 text-sm text-zinc-400">Loading dashboard…</main>;
  }

  if (!barber) {
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center">
          <p className="text-sm text-zinc-300">{error || 'Barber access is required.'}</p>
          <Link href="/" className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-white/10 px-4 text-sm text-white">
            Back to booking
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Barber workspace</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">{barber.name}</h1>
        </div>
        <p className="inline-flex items-center gap-2 text-sm text-zinc-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Live appointment updates
        </p>
      </header>

      {error && <p role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-3 text-sm text-rose-200">{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3 text-sm text-emerald-200">{notice}</p>}

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-zinc-400" />
          <h2 className="text-lg font-medium text-white">Appointments</h2>
        </div>
        {appointments.length ? (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            {appointments.map((appointment) => (
              <article key={appointment.id} className="grid gap-2 border-b border-white/10 p-4 last:border-b-0 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <h3 className="font-medium text-zinc-100">{appointment.customer_name}</h3>
                  <p className="mt-1 text-sm text-zinc-400">
                    {appointment.service?.name} · {appointment.duration_minutes} min
                  </p>
                  <a href={`tel:${appointment.customer_phone}`} className="mt-1 inline-block text-sm text-zinc-500 hover:text-zinc-300" dir="ltr">
                    {appointment.customer_phone}
                  </a>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm text-zinc-200">
                    {new Date(appointment.appointment_datetime).toLocaleString(lang)}
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">
                    {appointment.price_at_booking} ₺ · {appointment.status}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-zinc-500">
            No appointments yet.
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Scissors className="h-4 w-4 text-zinc-400" />
          <h2 className="text-lg font-medium text-white">Your service prices</h2>
        </div>
        <div className="divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          {services.map((service) => (
            <div key={service.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <h3 className="text-sm font-medium text-zinc-100">{service.name}</h3>
                <p className="mt-1 text-xs text-zinc-500">{service.duration_minutes} min</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="sr-only" htmlFor={`price-${service.id}`}>Price for {service.name}</label>
                <input
                  id={`price-${service.id}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={prices[service.id] ?? ''}
                  onChange={(event) => setPrices((current) => ({ ...current, [service.id]: event.target.value }))}
                  className="min-h-11 w-28 rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-zinc-100 outline-none focus:border-white/25"
                />
                <button
                  type="button"
                  onClick={() => savePrice(service)}
                  disabled={savingService === service.id}
                  className="min-h-11 rounded-xl bg-amber-400 px-4 text-sm font-medium text-zinc-950 transition hover:bg-amber-300 disabled:opacity-50"
                >
                  {savingService === service.id ? '…' : 'Save'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
