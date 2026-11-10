'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

/**
 * Fetch barbers and services for initial page render.
 */
export async function getBookingInitialData() {
  try {
    const [barbersRes, servicesRes] = await Promise.all([
      supabase.from('barbers').select('*').order('name'),
      supabase.from('services').select('*').order('price', { ascending: true }),
    ]);

    if (barbersRes.error) throw new Error(barbersRes.error.message);
    if (servicesRes.error) throw new Error(servicesRes.error.message);

    return {
      barbers: barbersRes.data || [],
      services: servicesRes.data || [],
    };
  } catch (err) {
    console.error('Error loading initial data:', err.message);
    // Return fallback sample data if Supabase is not yet populated
    return {
      barbers: [
        {
          id: '11111111-1111-1111-1111-111111111111',
          name: 'Marcus "Blade" Vance',
          working_hours: {
            start: '09:00',
            end: '19:00',
            lunch_start: '13:00',
            lunch_end: '14:00',
            days_off: [0],
          },
        },
        {
          id: '22222222-2222-2222-2222-222222222222',
          name: 'Julian Sterling',
          working_hours: {
            start: '10:00',
            end: '20:00',
            lunch_start: '14:00',
            lunch_end: '15:00',
            days_off: [1],
          },
        },
      ],
      services: [
        { id: 's1', name: 'Classic Gentleman Cut', duration_minutes: 45, price: 50 },
        { id: 's2', name: 'Signature Beard Sculpt & Hot Towel', duration_minutes: 30, price: 35 },
        { id: 's3', name: 'The Executive: Haircut & Royal Shave', duration_minutes: 75, price: 85 },
        { id: 's4', name: 'Head Shave & Scalp Treatment', duration_minutes: 45, price: 45 },
      ],
    };
  }
}

/**
 * Computes available time slots for the chosen barber, service, and date.
 */
export async function getAvailableSlots(barberId, serviceId, selectedDateString) {
  if (!barberId || !serviceId || !selectedDateString) {
    return { slots: [], error: 'missing_params' };
  }

  try {
    const [barberRes, serviceRes] = await Promise.all([
      supabase.from('barbers').select('*').eq('id', barberId).maybeSingle(),
      supabase.from('services').select('duration_minutes').eq('id', serviceId).maybeSingle(),
    ]);

    let workingHours = {
      start: '09:00',
      end: '19:00',
      lunch_start: '13:00',
      lunch_end: '14:00',
      days_off: [0],
    };
    let serviceDuration = 45;

    if (barberRes.data?.working_hours) {
      workingHours = barberRes.data.working_hours;
    }
    if (serviceRes.data?.duration_minutes) {
      serviceDuration = serviceRes.data.duration_minutes;
    }

    // Check Day off
    const targetDate = new Date(`${selectedDateString}T00:00:00`);
    const dayOfWeek = targetDate.getDay();
    if (workingHours.days_off?.includes(dayOfWeek)) {
      return { slots: [], isDayOff: true };
    }

    // Query existing appointments
    const startOfDay = `${selectedDateString}T00:00:00.000Z`;
    const endOfDay = `${selectedDateString}T23:59:59.999Z`;

    const { data: appointments } = await supabase
      .from('appointments')
      .select('appointment_datetime, service:services(duration_minutes)')
      .eq('barber_id', barberId)
      .neq('status', 'cancelled')
      .gte('appointment_datetime', startOfDay)
      .lte('appointment_datetime', endOfDay);

    // Calculate booked time spans in minutes from midnight
    const bookedIntervals = (appointments || []).map((appt) => {
      const apptDate = new Date(appt.appointment_datetime);
      const startMinutes = apptDate.getHours() * 60 + apptDate.getMinutes();
      const duration = appt.service?.duration_minutes || 45;
      return { start: startMinutes, end: startMinutes + duration };
    });

    const parseToMin = (t) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const workStart = parseToMin(workingHours.start);
    const workEnd = parseToMin(workingHours.end);
    const lunchStart = workingHours.lunch_start ? parseToMin(workingHours.lunch_start) : null;
    const lunchEnd = workingHours.lunch_end ? parseToMin(workingHours.lunch_end) : null;

    const intervalStep = 30; // 30-min steps
    const availableSlots = [];

    for (let time = workStart; time + serviceDuration <= workEnd; time += intervalStep) {
      const slotEnd = time + serviceDuration;

      // Check lunch collision
      if (lunchStart !== null && lunchEnd !== null) {
        if (time < lunchEnd && slotEnd > lunchStart) continue;
      }

      // Check booked appointments collision
      const isBooked = bookedIntervals.some(
        (b) => time < b.end && slotEnd > b.start
      );

      if (!isBooked) {
        const hh = Math.floor(time / 60).toString().padStart(2, '0');
        const mm = (time % 60).toString().padStart(2, '0');
        availableSlots.push(`${hh}:${mm}`);
      }
    }

    return { slots: availableSlots, isDayOff: false };
  } catch (error) {
    console.error('Error computing slots:', error.message);
    return { slots: [], error: 'system_error' };
  }
}

/**
 * Creates an appointment with race condition collision handling.
 */
export async function createAppointment(formData) {
  const { barberId, serviceId, date, timeSlot, customerName, customerPhone } = formData;

  if (!barberId || !serviceId || !date || !timeSlot || !customerName) {
    return { success: false, errorType: 'missing_fields' };
  }

  const appointmentDateTime = new Date(`${date}T${timeSlot}:00`).toISOString();

  const { data, error } = await supabase
    .from('appointments')
    .insert([
      {
        barber_id: barberId,
        service_id: serviceId,
        appointment_datetime: appointmentDateTime,
        customer_name: customerName,
        customer_phone: customerPhone || '00905362515878',
        status: 'confirmed',
      },
    ])
    .select()
    .single();

  if (error) {
    // Unique constraint violation in Postgres
    if (error.code === '23505' || error.message.includes('unique')) {
      return { success: false, errorType: 'double_booking' };
    }
    return { success: false, errorType: 'db_error', message: error.message };
  }

  revalidatePath('/');
  return { success: true, appointment: data };
}
