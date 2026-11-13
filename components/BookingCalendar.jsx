'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { getAvailableSlots, getBarberServices, createAppointment } from '@/app/actions/booking';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Clock, Calendar as CalendarIcon, MapPin, Phone } from 'lucide-react';

export default function BookingCalendar({ initialBarbers = [], initialServices = [] }) {
  const { lang, t, authUser } = useLanguage();
  const router = useRouter();

  // Selection states
  const [selectedBarber, setSelectedBarber] = useState(initialBarbers[0]?.id || '');
  const [services, setServices] = useState(initialServices);
  const [selectedService, setSelectedService] = useState(initialServices[0]?.id || '');
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Form states - empty by default with placeholder
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Slots & Loading
  const [slots, setSlots] = useState([]);
  const [isDayOff, setIsDayOff] = useState(false);
  const [isLoadingSlots, startSlotTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!selectedBarber) return;

    let active = true;
    getBarberServices(selectedBarber).then((result) => {
      if (!active) return;
      if (result.error) {
        setFeedback({ type: 'error', text: result.error });
        setServices([]);
        setSelectedService('');
        return;
      }

      setServices(result.services);
      setSelectedService((current) =>
        result.services.some((service) => service.id === current)
          ? current
          : result.services[0]?.id || ''
      );
    });

    return () => {
      active = false;
    };
  }, [selectedBarber]);

  // Fetch slots whenever barber, service, or date changes
  useEffect(() => {
    if (!selectedBarber || !selectedService || !selectedDate) return;

    setSelectedSlot(null);
    setFeedback(null);

    startSlotTransition(async () => {
      const res = await getAvailableSlots(selectedBarber, selectedService, selectedDate);
      if (res.error) {
        setFeedback({ type: 'error', text: t.systemError });
        setSlots([]);
      } else {
        setIsDayOff(res.isDayOff || false);
        setSlots(res.slots || []);
      }
    });
  }, [selectedBarber, selectedService, selectedDate, lang]);

  // Handle appointment submission
  const handleBooking = async (e) => {
    e.preventDefault();
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      setFeedback({ type: 'error', text: sessionError.message });
      return;
    }
    if (!sessionData.session) {
      router.push(`/auth?next=${encodeURIComponent('/#booking-section')}`);
      return;
    }

    if (!selectedSlot) {
      setFeedback({ type: 'error', text: t.selectSlotPrompt });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const res = await createAppointment({
      barberId: selectedBarber,
      serviceId: selectedService,
      date: selectedDate,
      timeSlot: selectedSlot,
      customerName,
      customerPhone,
    }, sessionData.session.access_token);

    setIsSubmitting(false);

    if (!res.success) {
      if (res.errorType === 'unauthenticated') {
        router.push(`/auth?next=${encodeURIComponent('/#booking-section')}`);
      } else if (res.errorType === 'double_booking') {
        setFeedback({ type: 'error', text: t.doubleBookingError });
      } else if (res.errorType === 'invalid_time') {
        setFeedback({ type: 'error', text: t.auth.invalidTime });
      } else {
        setFeedback({ type: 'error', text: res.message || t.systemError });
      }
    } else {
      const barberObj = initialBarbers.find((b) => b.id === selectedBarber);
      const barberName = t.barbers[barberObj?.name] || barberObj?.name;
      setFeedback({
        type: 'success',
        text: `${t.successPrefix} ${barberName} ${t.atTime} ${selectedSlot}`,
      });
      setSlots((prev) => prev.filter((s) => s !== selectedSlot));
      setSelectedSlot(null);
    }
  };

  const activeServiceObj = services.find((s) => s.id === selectedService);
  const serviceLocalized = activeServiceObj ? (t.services[activeServiceObj.name] || { name: activeServiceObj.name, desc: '' }) : null;
  const activeBarber = initialBarbers.find((barber) => barber.id === selectedBarber);
  const mapUrl = /^https?:\/\//i.test(activeBarber?.map_url || '') ? activeBarber.map_url : null;

  return (
    <div
      id="booking-section"
      className="relative w-full py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center overflow-hidden"
    >
      <div className="relative w-full max-w-4xl space-y-8 rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-9">
        
        {/* Top Header Badge & Title */}
        <div className="flex flex-col items-center gap-6 border-b border-white/10 pb-7 text-center">
          <div className="space-y-3">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
              <span className="text-xs font-medium uppercase tracking-widest text-zinc-400">
                {t.brandBadge}
              </span>
            </div>

            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {t.brandTitle}
            </h2>
            <p className="mx-auto max-w-lg text-sm leading-relaxed text-zinc-400">
              {t.brandSubtitle}
            </p>
          </div>

          {activeServiceObj && (
            <div className="shrink-0 rounded-2xl border border-white/10 bg-black/10 p-4">
              <p className="text-xs font-medium text-zinc-400">{t.costSummary}</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-zinc-100">
                  {t.currency} {activeServiceObj.price}
                </span>
                <span className="text-xs text-zinc-500">
                  / {activeServiceObj.duration_minutes} {t.durationMinutes}
                </span>
              </div>
            </div>
          )}
        </div>
        <p className="text-xs font-medium text-zinc-500">{t.bookingHours}</p>

        {/* Controls: Service & Barber Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Service Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
              <span>{t.selectService}</span>
            </label>
            <div className="relative">
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                disabled={!services.length}
                className="min-h-12 w-full appearance-none rounded-xl border border-white/10 bg-[#191b1e] px-4 py-3.5 text-sm text-zinc-100 outline-none transition focus:border-white/25"
              >
                {services.map((service) => {
                  const loc = t.services[service.name] || { name: service.name };
                  return (
                    <option key={service.id} value={service.id} className="bg-[#191b1e] text-zinc-100">
                      {loc.name} ({t.currency} {service.price} • {service.duration_minutes} {t.durationMinutes})
                    </option>
                  );
                })}
              </select>
            </div>
            {serviceLocalized?.desc && (
              <p className="px-1 text-xs italic text-zinc-500">{serviceLocalized.desc}</p>
            )}
          </div>

          {/* Barber Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
              <span>{t.selectBarber}</span>
            </label>
            <div className="relative">
              <select
                value={selectedBarber}
                onChange={(e) => setSelectedBarber(e.target.value)}
                className="min-h-12 w-full appearance-none rounded-xl border border-white/10 bg-[#191b1e] px-4 py-3.5 text-sm text-zinc-100 outline-none transition focus:border-white/25"
              >
                {initialBarbers.map((barber) => {
                  const locName = t.barbers[barber.name] || barber.name;
                  return (
                    <option key={barber.id} value={barber.id} className="bg-[#191b1e] text-zinc-100">
                      {locName}
                    </option>
                  );
                })}
              </select>
            </div>
            {(activeBarber?.phone || activeBarber?.address || mapUrl) && (
              <div className="space-y-1 px-1 text-xs text-zinc-400">
                {activeBarber.address && (
                  <p className="flex items-start gap-1.5">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-500" />
                    <span>{activeBarber.address}</span>
                  </p>
                )}
                {activeBarber.phone && (
                  <a href={`tel:${activeBarber.phone}`} className="flex items-center gap-1.5 hover:text-zinc-200">
                    <Phone className="h-3.5 w-3.5 text-zinc-500" />
                    <span dir="ltr">{activeBarber.phone}</span>
                  </a>
                )}
                {mapUrl && (
                  <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex text-zinc-300 hover:text-white hover:underline">
                    {t.auth.mapLocation}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Date Selection & Available Slots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Date Picker */}
          <div className="space-y-2 md:col-span-1">
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
              <CalendarIcon className="inline h-3.5 w-3.5 text-zinc-500" />
              <span>{t.selectDate}</span>
            </label>
            <input
              type="date"
              min={todayStr}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="min-h-12 w-full rounded-xl border border-white/10 bg-[#191b1e] px-4 py-3.5 text-sm text-zinc-100 outline-none transition focus:border-white/25"
            />
          </div>

          {/* Time Slots Area */}
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-zinc-400">
                <Clock className="h-3.5 w-3.5 text-zinc-500" />
                <span>{t.availableSlots}</span>
              </label>
              {isLoadingSlots && (
                <span className="text-xs font-medium text-zinc-500">
                  {t.calculatingSlots}
                </span>
              )}
            </div>

            {isLoadingSlots ? (
              <div className="flex h-36 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02]">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-zinc-500 border-t-transparent" />
              </div>
            ) : isDayOff ? (
              <div className="flex h-36 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-center text-sm font-medium text-zinc-300">
                {t.dayOff}
              </div>
            ) : slots.length === 0 ? (
              <div className="flex h-36 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-center text-sm text-zinc-500">
                {t.noSlots}
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-44 overflow-y-auto pr-1">
                {slots.map((slot) => {
                  const isSelected = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2.5 px-2 rounded-xl text-sm font-extrabold transition-all duration-200 border ${
                        isSelected
                          ? 'border-white/30 bg-white/10 text-white'
                          : 'border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/25 hover:bg-white/[0.06]'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Customer Information & Booking Form */}
        <form onSubmit={handleBooking} className="space-y-5 border-t border-white/10 pt-6">
          {!authUser ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
              <p className="text-sm text-zinc-300">
                {lang === 'ar'
                  ? 'سجّل الدخول أو أنشئ حساباً لتأكيد حجزك.'
                  : lang === 'tr'
                    ? 'Randevunuzu onaylamak için giriş yapın veya hesap oluşturun.'
                    : 'Sign in or create an account to confirm your booking.'}
              </p>
              <Link
                href={`/auth?next=${encodeURIComponent('/#booking-section')}`}
                className="mt-3 inline-flex min-h-11 items-center justify-center rounded-xl bg-amber-400 px-5 text-sm font-semibold text-zinc-950"
              >
                {t.nav.signIn}
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                    {t.customerNameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t.customerNamePlaceholder}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-white/25 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                    {t.customerPhoneLabel}
                  </label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    placeholder={t.customerPhonePlaceholder || '+90 5XX XXX XX XX'}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-left text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-white/25 focus:outline-none"
                  />
                </div>
              </div>

              {feedback && (
                <div
                  role="status"
                  className={`rounded-2xl border p-4 text-sm font-medium ${
                    feedback.type === 'error'
                      ? 'border-rose-400/20 bg-rose-400/5 text-rose-200'
                      : 'border-emerald-400/20 bg-emerald-400/5 text-emerald-200'
                  }`}
                >
                  {feedback.text}
                </div>
              )}

              <button
                type="submit"
                disabled={!selectedSlot || isSubmitting}
                className="min-h-12 w-full rounded-xl bg-amber-400 px-6 text-base font-semibold text-zinc-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSubmitting
                  ? t.securingSlot
                  : selectedSlot
                    ? `${t.submitBooking} (${selectedSlot})`
                    : t.selectSlotPrompt}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
