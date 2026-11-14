import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';

export const metadata = {
  title: 'العالمية للحلاقة | Al-Alamiah Barbershop | Uluslararası Berber',
  description: 'Premium luxury barbershop booking system with real-time availability in Arabic, Turkish, and English.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar">
      <body className="min-h-screen bg-[#100030] text-zinc-100 antialiased">
        <LanguageProvider>
          <Header />
          <div className="flex min-h-[calc(100vh-4rem)] flex-col">
            {children}
            <Footer />
          </div>
          <AuthModal />
        </LanguageProvider>
      </body>
    </html>
  );
}
