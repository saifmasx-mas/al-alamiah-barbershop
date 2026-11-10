'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Bot, X, Send, Sparkles } from 'lucide-react';

export default function Chatbot() {
  const { lang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages([
      {
        id: 1,
        sender: 'bot',
        text: t.chatbot.welcome,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [lang, t]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = (textToSend) => {
    const query = (textToSend || inputValue).trim();
    if (!query) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const lower = query.toLowerCase();
      let reply = t.chatbot.answers.default;

      if (
        lower.includes('سعر') ||
        lower.includes('اسعار') ||
        lower.includes('أسعار') ||
        lower.includes('fiyat') ||
        lower.includes('ücret') ||
        lower.includes('price') ||
        lower.includes('cost')
      ) {
        reply = t.chatbot.answers.prices;
      } else if (
        lower.includes('وقت') ||
        lower.includes('أوقات') ||
        lower.includes('ساعات') ||
        lower.includes('ساعة') ||
        lower.includes('saat') ||
        lower.includes('zaman') ||
        lower.includes('hour') ||
        lower.includes('open')
      ) {
        reply = t.chatbot.answers.hours;
      } else if (
        lower.includes('حجز') ||
        lower.includes('موعد') ||
        lower.includes('احجز') ||
        lower.includes('randevu') ||
        lower.includes('book') ||
        lower.includes('slot') ||
        lower.includes('reserve')
      ) {
        reply = t.chatbot.answers.booking;
      } else if (
        lower.includes('حلاق') ||
        lower.includes('مصفف') ||
        lower.includes('berber') ||
        lower.includes('barber') ||
        lower.includes('blade') ||
        lower.includes('sterling')
      ) {
        reply = t.chatbot.answers.barbers;
      } else if (
        lower.includes('موقع') ||
        lower.includes('عنوان') ||
        lower.includes('اين') ||
        lower.includes('أين') ||
        lower.includes('nerede') ||
        lower.includes('konum') ||
        lower.includes('where') ||
        lower.includes('location') ||
        lower.includes('address')
      ) {
        reply = t.chatbot.answers.location;
      }

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <>
      {/* Floating Trigger Button in Royal Purple & Gold */}
      <div className="fixed bottom-6 ltr:right-6 rtl:left-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group p-4 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-purple-950 shadow-[0_10px_35px_rgba(250,204,21,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center border-2 border-yellow-200"
          aria-label="Open AI Chatbot"
        >
          <span className="absolute -inset-1.5 rounded-full bg-amber-400/40 animate-ping pointer-events-none" />
          
          {isOpen ? (
            <X className="w-6 h-6 transition-transform rotate-90" />
          ) : (
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6 animate-bounce" />
              <span className="hidden sm:inline font-black text-xs tracking-wider">
                {lang === 'ar' ? 'المساعد الذكي' : lang === 'tr' ? 'Canlı Destek' : 'AI Concierge'}
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="fixed bottom-24 ltr:right-4 rtl:left-4 sm:ltr:right-6 sm:rtl:left-6 z-50 w-[92vw] sm:w-[390px] h-[530px] max-h-[82vh] backdrop-blur-3xl bg-[#17092F]/95 border-2 border-amber-400/35 rounded-3xl shadow-[0_25px_70px_rgba(10,2,22,0.95)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="p-4 bg-[#230E44] border-b border-amber-400/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-300 p-0.5 shadow-sm">
                <div className="w-full h-full bg-[#180A2F] rounded-[10px] flex items-center justify-center text-amber-300">
                  <Bot className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-300 flex items-center gap-1.5">
                  <span>{t.chatbot.title}</span>
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{t.chatbot.status}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-purple-300 hover:text-white p-1 rounded-lg hover:bg-white/[0.05]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs leading-relaxed">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-purple-950 font-black shadow-md'
                      : 'bg-[#200B3E] text-yellow-100 border border-amber-400/25 font-medium'
                  }`}
                >
                  <p>{m.text}</p>
                </div>
                <span className="text-[10px] text-purple-300/60 mt-1 px-1 font-medium">
                  {m.time}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-[#200B3E] text-amber-300 w-16 border border-amber-400/20">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping delay-150" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping delay-300" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Question Chips */}
          <div className="px-3 py-2 bg-[#200B3E]/60 border-t border-purple-500/20 flex gap-1.5 overflow-x-auto no-scrollbar">
            {t.chatbot.quickQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-[#2B1050] hover:bg-amber-400 hover:text-purple-950 border border-amber-400/30 text-[11px] text-yellow-200 font-bold transition-all"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input & Send Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-[#190932] border-t border-amber-400/20 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t.chatbot.placeholder}
              className="flex-1 bg-[#200B3E] border border-amber-400/30 rounded-xl px-3 py-2.5 text-xs text-yellow-100 placeholder:text-purple-400/60 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-purple-950 hover:brightness-110 disabled:opacity-40 transition-all shadow-sm font-bold"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
