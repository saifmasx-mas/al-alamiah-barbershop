'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { getAvailableSlots, createAppointment } from '@/app/actions/booking';
import { useLanguage } from '@/context/LanguageContext';
import { Sparkles, Crown, Clock, Calendar as CalendarIcon } from 'lucide-react';

export default function BookingCalendar({ initialBarbers = [], initialServices = [] }) {
  const { lang, t, user } = useLanguage();

  // Selection states
  const [selectedBarber, setSelectedBarber] = useState(initialBarbers[0]?.id || '');
  const [selectedService, setSelectedService] = useState(initialServices[0]?.id || '');
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Form states - autofill user name if logged in
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState('00905362515878');

  useEffect(() => {
    if (user?.name && !customerName) {
      setCustomerName(user.name);
    }
  }, [user]);

  // Slots & Loading
  const [slots, setSlots] = useState([]);
  const [isDayOff, setIsDayOff] = useState(false);
  const [isLoadingSlots, startSlotTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

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
    });

    setIsSubmitting(false);

    if (!res.success) {
      if (res.errorType === 'double_booking') {
        setFeedback({ type: 'error', text: t.doubleBookingError });
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

  const activeServiceObj = initialServices.find((s) => s.id === selectedService);
  const serviceLocalized = activeServiceObj ? (t.services[activeServiceObj.name] || { name: activeServiceObj.name, desc: '' }) : null;

  return (
    <div
      id="booking-section"
      className="relative w-full py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center overflow-hidden"
    >
      {/* Pi Network Style Glowing Ambient Orbs */}
      <div className="absolute top-1/4 -left-40 w-[500px] h-[500px] bg-purple-600/25 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-violet-800/15 rounded-full blur-[180px] pointer-events-none" />

      {/* Main Glassmorphism Panel in Royal Purple & Gold */}
      <div className="relative w-full max-w-4xl backdrop-blur-3xl bg-[#17092F]/85 border-2 border-amber-400/30 rounded-3xl shadow-[0_25px_70px_rgba(10,2,22,0.95)] p-6 sm:p-10 space-y-8">
        
        {/* Top Header Badge & Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-amber-400/20 pb-7">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-900/90 to-[#2A0E4E] border border-amber-400/50 shadow-[0_0_15px_rgba(250,204,21,0.25)]">
              <Crown className="w-4 h-4 text-amber-300" />
              <span className="text-xs uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400 font-extrabold">
                {t.brandBadge}
              </span>
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-amber-300 to-yellow-500 drop-shadow-[0_2px_10px_rgba(234,179,8,0.3)]">
                {t.brandTitle}
              </span>
            </h2>
            <p className="text-sm text-purple-200/80 max-w-lg leading-relaxed font-medium">
              {t.brandSubtitle}
            </p>
          </div>

          {activeServiceObj && (
            <div className="bg-gradient-to-br from-[#260E4D] to-[#17092F] p-4 rounded-2xl border border-amber-400/40 shadow-[0_0_20px_rgba(234,179,8,0.15)] shrink-0">
              <p className="text-xs text-amber-200/90 font-bold">{t.costSummary}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-400">
                  {t.currency} {activeServiceObj.price}
                </span>
                <span className="text-xs text-purple-300">
                  / {activeServiceObj.duration_minutes} {t.durationMinutes}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Controls: Service & Barber Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Service Selector */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-amber-300 font-bold block flex items-center gap-1.5">
              <span>{t.selectService}</span>
            </label>
            <div className="relative">
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full appearance-none bg-[#200B3E] border border-amber-400/30 hover:border-amber-400/70 rounded-2xl px-4 py-3.5 text-sm text-yellow-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all cursor-pointer shadow-inner"
              >
                {initialServices.map((service) => {
                  const loc = t.services[service.name] || { name: service.name };
                  return (
                    <option key={service.id} value={service.id} className="bg-[#17092F] text-yellow-100">
                      {loc.name} ({t.currency} {service.price} • {service.duration_minutes} {t.durationMinutes})
                    </option>
                  );
                })}
              </select>
            </div>
            {serviceLocalized?.desc && (
              <p className="text-xs text-purple-300/80 italic px-1">{serviceLocalized.desc}</p>
            )}
          </div>

          {/* Barber Selector */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-amber-300 font-bold block flex items-center gap-1.5">
              <span>{t.selectBarber}</span>
            </label>
            <div className="relative">
              <select
                value={selectedBarber}
                onChange={(e) => setSelectedBarber(e.target.value)}
                className="w-full appearance-none bg-[#200B3E] border border-amber-400/30 hover:border-amber-400/70 rounded-2xl px-4 py-3.5 text-sm text-yellow-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all cursor-pointer shadow-inner"
              >
                {initialBarbers.map((barber) => {
                  const locName = t.barbers[barber.name] || barber.name;
                  return (
                    <option key={barber.id} value={barber.id} className="bg-[#17092F] text-yellow-100">
                      {locName}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Date Selection & Available Slots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Date Picker */}
          <div className="space-y-2 md:col-span-1">
            <label className="text-xs uppercase tracking-wider text-amber-300 font-bold block flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.selectDate}</span>
            </label>
            <input
              type="date"
              min={todayStr}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-[#200B3E] border border-amber-400/30 hover:border-amber-400/70 rounded-2xl px-4 py-3.5 text-sm text-yellow-100 focus:outline-none focus:border-amber-400 transition-all cursor-pointer shadow-inner"
            />
          </div>

          {/* Time Slots Area */}
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.availableSlots}</span>
              </label>
              {isLoadingSlots && (
                <span className="text-xs text-amber-300 animate-pulse font-bold">
                  {t.calculatingSlots}
                </span>
              )}
            </div>

            {isLoadingSlots ? (
              <div className="h-36 flex items-center justify-center rounded-2xl bg-purple-950/40 border border-purple-500/20">
                <div className="animate-spin h-7 w-7 border-2 border-amber-400 border-t-transparent rounded-full" />
              </div>
            ) : isDayOff ? (
              <div className="h-36 flex items-center justify-center rounded-2xl bg-purple-950/50 border border-amber-500/30 p-4 text-center text-amber-200 font-medium text-sm">
                {t.dayOff}
              </div>
            ) : slots.length === 0 ? (
              <div className="h-36 flex items-center justify-center rounded-2xl bg-purple-950/40 border border-purple-500/20 p-4 text-center text-purple-300 text-sm">
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
                          ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-purple-950 border-yellow-200 shadow-[0_0_25px_rgba(250,204,21,0.6)] scale-105'
                          : 'bg-[#200B3E] text-yellow-100 border-amber-400/20 hover:border-amber-400 hover:bg-purple-900/40'
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
        <form onSubmit={handleBooking} className="border-t border-amber-400/20 pt-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-amber-300 font-bold block">
                {t.customerNameLabel}
              </label>
              <input
                type="text"
                required
                placeholder={t.customerNamePlaceholder}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-[#200B3E] border border-amber-400/30 rounded-2xl px-4 py-3.5 text-sm text-yellow-100 placeholder:text-purple-400/60 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-amber-300 font-bold block">
                {t.customerPhoneLabel}
              </label>
              <input
                type="tel"
                required
                dir="ltr"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-[#200B3E] border border-amber-400/30 rounded-2xl px-4 py-3.5 text-sm text-yellow-100 placeholder:text-purple-400/60 focus:outline-none focus:border-amber-400 text-left"
              />
            </div>
          </div>

          {/* Feedback Alerts */}
          {feedback && (
            <div
              className={`p-4 rounded-2xl text-sm font-bold border transition-all ${
                feedback.type === 'error'
                  ? 'bg-rose-950/60 border-rose-500/50 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
                  : 'bg-emerald-950/60 border-emerald-400/50 text-emerald-200 shadow-[0_0_20px_rgba(52,211,153,0.2)]'
              }`}
            >
              {feedback.text}
            </div>
          )}

          {/* Submit Action Button: High Impact Royal Gold */}
          <button
            type="submit"
            disabled={!selectedSlot || isSubmitting}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-purple-950 font-black text-base tracking-wide shadow-[0_10px_35px_rgba(250,204,21,0.4)] hover:brightness-110 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-purple-950" />
            <span>
              {isSubmitting
                ? t.securingSlot
                : selectedSlot
                ? `${t.submitBooking} (${selectedSlot})`
                : t.selectSlotPrompt}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
