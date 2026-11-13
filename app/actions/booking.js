'use server';

import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const BOOKING_START_MINUTES = 9 * 60 + 30;
const BOOKING_END_MINUTES = 22 * 60;

const FALLBACK_BARBERS = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Marcus "Blade" Vance',
    working_hours: {
      start: '09:30',
      end: '22:00',
      lunch_start: '13:00',
      lunch_end: '14:00',
      days_off: [0],
    },
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Julian Sterling',
    working_hours: {
      start: '09:30',
      end: '22:00',
      lunch_start: '14:00',
      lunch_end: '15:00',
      days_off: [1],
    },
  },
];

const FALLBACK_SERVICES = [
  { id: 's1', name: 'Classic Gentleman Cut', duration_minutes: 45, price: 50 },
  { id: 's2', name: 'Signature Beard Sculpt & Hot Towel', duration_minutes: 30, price: 35 },
  { id: 's3', name: 'The Executive: Haircut & Royal Shave', duration_minutes: 75, price: 85 },
  { id: 's4', name: 'Head Shave & Scalp Treatment', duration_minutes: 45, price: 45 },
];

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && !url.includes('your-project') && !url.includes('example');
}

function makeDemoSlots(duration) {
  const slots = [];
  for (let time = BOOKING_START_MINUTES; time + duration <= BOOKING_END_MINUTES; time += 30) {
    const hours = Math.floor(time / 60).toString().padStart(2, '0');
    const minutes = (time % 60).toString().padStart(2, '0');
    slots.push(`${hours}:${minutes}`);
  }
  return slots;
}

/**
 * Fetch barbers and services for initial page render.
 */
export async function getBookingInitialData() {
  if (!isSupabaseConfigured()) {
    return {
      barbers: FALLBACK_BARBERS,
      services: FALLBACK_SERVICES,
    };
  }

  try {
    const [barbersRes, servicesRes] = await Promise.all([
      supabase.from('barbers').select('*').order('name'),
      supabase.from('services').select('*').order('price', { ascending: true }),
    ]);

    const barbers = barbersRes.data && barbersRes.data.length > 0 ? barbersRes.data : FALLBACK_BARBERS;
    const services = servicesRes.data && servicesRes.data.length > 0 ? servicesRes.data : FALLBACK_SERVICES;

    return { barbers, services };
  } catch (err) {
    console.error('Error loading initial data:', err.message);
    return {
      barbers: FALLBACK_BARBERS,
      services: FALLBACK_SERVICES,
    };
  }
}

export async function getBarberServices(barberId) {
  if (!barberId) return { services: [], error: 'missing_barber' };

  if (!isSupabaseConfigured()) {
    return { services: FALLBACK_SERVICES };
  }

  const { data: barberServices, error } = await supabase
    .from('barber_services')
    .select('is_active, price_override, duration_override_minutes, service:services(id, name, duration_minutes, price)')
    .eq('barber_id', barberId);

  if (error) {
    return { services: [], error: error.message };
  }

  if (barberServices?.length) {
    return {
      services: barberServices
        .filter((entry) => entry.is_active !== false)
        .filter((entry) => entry.service)
        .map((entry) => ({
          ...entry.service,
          price: entry.price_override ?? entry.service.price,
          duration_minutes: entry.duration_override_minutes ?? entry.service.duration_minutes,
        })),
    };
  }

  const { data: services, error: serviceError } = await supabase
    .from('services')
    .select('*')
    .order('price', { ascending: true });

  if (serviceError) return { services: [], error: serviceError.message };
  return { services: services || [] };
}

/**
 * Computes available time slots for the chosen barber, service, and date.
 */
export async function getAvailableSlots(barberId, serviceId, selectedDateString) {
  if (!barberId || !serviceId || !selectedDateString) {
    return { slots: [], error: 'missing_params' };
  }

  // Calculate day off
  const targetDate = new Date(`${selectedDateString}T00:00:00`);
  const dayOfWeek = targetDate.getDay();

  // If Supabase not yet configured with real URL, return rich realistic slots
  if (!isSupabaseConfigured()) {
    const barber = FALLBACK_BARBERS.find((b) => b.id === barberId) || FALLBACK_BARBERS[0];
    if (barber.working_hours.days_off.includes(dayOfWeek)) {
      return { slots: [], isDayOff: true };
    }

    const serviceDuration = FALLBACK_SERVICES.find((service) => service.id === serviceId)?.duration_minutes || 45;
    return { slots: makeDemoSlots(serviceDuration), isDayOff: false };
  }

  try {
    const [barberRes, serviceRes] = await Promise.all([
      supabase.from('barbers').select('working_hours, buffer_minutes').eq('id', barberId).maybeSingle(),
      supabase.from('services').select('duration_minutes').eq('id', serviceId).maybeSingle(),
    ]);
    if (barberRes.error) throw barberRes.error;
    if (serviceRes.error) throw serviceRes.error;
    const { data: serviceOverride, error: overrideError } = await supabase
      .from('barber_services')
      .select('is_active, duration_override_minutes')
      .eq('barber_id', barberId)
      .eq('service_id', serviceId)
      .maybeSingle();
    if (overrideError) throw overrideError;
    if (!barberRes.data || !serviceRes.data) {
      return { slots: [], error: 'The selected barber or service could not be found.' };
    }
    if (serviceOverride && !serviceOverride.is_active) {
      return { slots: [], error: 'This service is not available from the selected barber.' };
    }

    let workingHours = {
      start: '09:30',
      end: '22:00',
      lunch_start: '13:00',
      lunch_end: '14:00',
      days_off: [0],
    };
    let serviceDuration = 45;
    const bufferMinutes = barberRes.data?.buffer_minutes ?? 10;

    if (barberRes.data?.working_hours) {
      workingHours = barberRes.data.working_hours;
    }
    if (serviceRes.data?.duration_minutes) {
      serviceDuration = serviceRes.data.duration_minutes;
    }
    if (serviceOverride?.duration_override_minutes) {
      serviceDuration = serviceOverride.duration_override_minutes;
    }

    if (workingHours.days_off?.includes(dayOfWeek)) {
      return { slots: [], isDayOff: true };
    }

    // Query existing appointments
    const startOfDay = `${selectedDateString}T00:00:00.000Z`;
    const endOfDay = `${selectedDateString}T23:59:59.999Z`;

    const { data: appointments, error: appointmentsError } = await supabase.rpc(
      'get_barber_busy_windows',
      { p_barber_id: barberId, p_start: startOfDay, p_end: endOfDay }
    );
    if (appointmentsError) throw appointmentsError;

    const bookedIntervals = (appointments || []).map((appt) => {
      const apptDate = new Date(appt.starts_at);
      const startMinutes = apptDate.getHours() * 60 + apptDate.getMinutes();
      const busyUntil = new Date(appt.busy_until);
      const endMinutes = busyUntil.getHours() * 60 + busyUntil.getMinutes();
      return { start: startMinutes, end: endMinutes };
    });

    const parseToMin = (t) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const workStart = Math.max(BOOKING_START_MINUTES, parseToMin(workingHours.start));
    const workEnd = Math.min(BOOKING_END_MINUTES, parseToMin(workingHours.end));
    const lunchStart = workingHours.lunch_start ? parseToMin(workingHours.lunch_start) : null;
    const lunchEnd = workingHours.lunch_end ? parseToMin(workingHours.lunch_end) : null;

    const intervalStep = 30;
    const availableSlots = [];

    for (let time = workStart; time + serviceDuration <= workEnd; time += intervalStep) {
      const slotEnd = time + serviceDuration;

      if (lunchStart !== null && lunchEnd !== null) {
        if (time < lunchEnd && slotEnd > lunchStart) continue;
      }

      const isBooked = bookedIntervals.some(
        (b) => time < b.end && slotEnd > b.start
      );

      const overlapsBuffer = bookedIntervals.some(
        (b) => time < b.end && slotEnd + bufferMinutes > b.start
      );

      if (!isBooked && !overlapsBuffer) {
        const hh = Math.floor(time / 60).toString().padStart(2, '0');
        const mm = (time % 60).toString().padStart(2, '0');
        availableSlots.push(`${hh}:${mm}`);
      }
    }

    return { slots: availableSlots, isDayOff: false };
  } catch (error) {
    console.error('Unable to calculate available slots:', error.message);
    return { slots: [], error: error.message };
  }
}

/**
 * Creates an appointment with race condition collision handling.
 */
export async function createAppointment(formData, accessToken) {
  const { barberId, serviceId, date, timeSlot, customerName, customerPhone } = formData;

  if (!accessToken) {
    return { success: false, errorType: 'unauthenticated' };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey || !isSupabaseConfigured()) {
    return { success: false, errorType: 'db_error', message: 'Supabase is not configured.' };
  }

  const authenticatedSupabase = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: authData, error: authError } = await authenticatedSupabase.auth.getUser(accessToken);
  if (authError || !authData.user) {
    return { success: false, errorType: 'unauthenticated' };
  }

  if (!barberId || !serviceId || !date || !timeSlot || !customerName || !customerPhone) {
    return { success: false, errorType: 'missing_fields' };
  }

  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(timeSlot);
  if (!match) {
    return { success: false, errorType: 'invalid_time' };
  }

  const startMinutes = Number(match[1]) * 60 + Number(match[2]);
  if (
    startMinutes < BOOKING_START_MINUTES ||
    (startMinutes - BOOKING_START_MINUTES) % 30 !== 0
  ) {
    return { success: false, errorType: 'invalid_time' };
  }

  let serviceDuration;
  {
    const { data: service, error } = await authenticatedSupabase
      .from('services')
      .select('duration_minutes')
      .eq('id', serviceId)
      .maybeSingle();

    if (error) {
      return { success: false, errorType: 'db_error', message: error.message };
    }
    if (!service) {
      return { success: false, errorType: 'invalid_fields' };
    }
    serviceDuration = service.duration_minutes;
    const { data: override, error: overrideError } = await authenticatedSupabase
      .from('barber_services')
      .select('is_active, duration_override_minutes')
      .eq('barber_id', barberId)
      .eq('service_id', serviceId)
      .maybeSingle();
    if (overrideError) {
      return { success: false, errorType: 'db_error', message: overrideError.message };
    }
    if (override && !override.is_active) {
      return { success: false, errorType: 'invalid_fields' };
    }
    if (override?.duration_override_minutes) {
      serviceDuration = override.duration_override_minutes;
    }
  }

  if (!serviceDuration) {
    return { success: false, errorType: 'invalid_fields' };
  }

  if (startMinutes + serviceDuration > BOOKING_END_MINUTES) {
    return { success: false, errorType: 'invalid_time' };
  }

  const appointmentDateTime = new Date(`${date}T${timeSlot}:00`).toISOString();

  try {
    const { data, error } = await authenticatedSupabase
      .from('appointments')
      .insert([
        {
          barber_id: barberId,
          service_id: serviceId,
          appointment_datetime: appointmentDateTime,
          customer_id: authData.user.id,
          customer_name: customerName,
          customer_phone: customerPhone,
          status: 'confirmed',
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '23505' || error.code === '23P01' || error.message.includes('unique')) {
        return { success: false, errorType: 'double_booking' };
      }
      return { success: false, errorType: 'db_error', message: error.message };
    }

    revalidatePath('/');
    return { success: true, appointment: data };
  } catch (err) {
    console.error('Appointment creation failed:', err.message);
    return { success: false, errorType: 'db_error', message: err.message };
  }
}
