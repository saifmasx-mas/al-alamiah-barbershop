import { getBookingInitialData } from '@/app/actions/booking';
import BookingCalendar from '@/components/BookingCalendar';

export const revalidate = 0; // Fetch fresh data on each load

export default async function HomePage() {
  const { barbers, services } = await getBookingInitialData();

  return (
    <main>
      <BookingCalendar initialBarbers={barbers} initialServices={services} />
    </main>
  );
}
