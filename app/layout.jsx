import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Chatbot from '@/components/Chatbot';
import AuthModal from '@/components/AuthModal';

export const metadata = {
  title: 'العالمية للحلاقة | Al-Alamiah Barbershop | Uluslararası Berber',
  description: 'Premium luxury barbershop booking system with real-time availability in Arabic, Turkish, and English.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar">
      <body className="antialiased min-h-screen bg-[#07080A] text-zinc-100 flex flex-col">
        <LanguageProvider>
          <Header />
          <div className="flex-1">
            {children}
          </div>
          <Footer />
          <Chatbot />
          <AuthModal />
        </LanguageProvider>
      </body>
    </html>
  );
}
