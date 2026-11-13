# العالمية للحلاقة | Al-Alamiah Barbershop | Uluslararası Berber

نظام حجز مواعيد صالون حلاقة فاخر مبني بتقنيات **Next.js 14 (App Router)**، **Tailwind CSS (Dark Glassmorphism)**، و **Supabase PostgreSQL**.

---

## 🌍 اللغات المدعومة / Supported Languages / Desteklenen Diller
- **العربية (Arabic):** دعم كامل للاتجاه من اليمين إلى اليسار (`RTL`)، تعريب شامل للخدمات، الأوقات، وأسماء المصففين.
- **Türkçe (Turkish):** Tam Türkçe dil desteği, yerelleştirilmiş randevu arayüzü ve saat hesaplaması.
- **English:** Full luxury barbershop styling, terminology, and real-time slot booking.

---

## 🚀 المميزات الرئيسية / Key Features
1. **تصميم زجاجي فاخر (Glassmorphism & Dusk Glow):** ألوان فحمية عميقة مع تدرجات ذهبية دافئة (`Charcoal & Amber Dusk`).
2. **منع الحجز المزدوج (Double-Booking Prevention):** فحص مباشر على مستوى قاعدة البيانات باستخدام `Partial Unique Index` في Supabase PostgreSQL.
3. **حساب التوافر الفعلي للوقت:** حساب أوقات الدوام، فترات الغداء، والعطلات الأسبوعية لكل حلاق تلقائياً.
4. **تعدد اللغات الفوري:** زر مدمج للتحويل بين (العربية / Türkçe / English) مع تبديل تلقائي لاتجاه الصفحة (`dir="rtl"` أو `dir="ltr"`).
5. **حسابات الحلاقين فقط:** تسجيل دخول وإنشاء حساب للحلاقين مع الهاتف والعنوان ورابط الخريطة؛ يمكن للزبائن حجز المواعيد دون حساب.
6. **ساعات الحجز:** المواعيد متاحة من 09:30 صباحاً وحتى 10:00 مساءً.

---

## 🛠️ خطوات التشغيل / Getting Started

### 1. تثبيت الحزم (Install Dependencies)
```bash
cd "D:\al-alamiah-barbershop"
npm install
```

### 2. إعداد قاعدة بيانات Supabase (Database Setup)
- انسخ محتويات ملف `supabase/schema.sql` والصقها في **SQL Editor** في لوحة تحكم Supabase.
- سيتم إنشاء الجداول الثلاثة (`services`, `barbers`, `appointments`) وإعداد سياسات الأمان RLS وحقن البيانات التجريبية.
- إذا كانت قاعدة البيانات موجودة وتحتوي على بيانات، لا تعِد تشغيل `schema.sql` لأنه يعيد إنشاء الجداول. شغّل `supabase/barber_accounts_migration.sql` لإضافة حقول حسابات الحلاقين وتحديث ساعات العمل مع الاحتفاظ بالمواعيد.
- فعّل تأكيد البريد الإلكتروني في Supabase Auth أو عطّله حسب سياسة التسجيل المطلوبة. عند تفعيله، يؤكد الحلاق بريده قبل تسجيل الدخول.

### 3. إعداد المتغيرات البيئية (Environment Variables)
قم بإنشاء ملف `.env.local` داخل المجلد:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. تشغيل السيرفر المحلي (Run Development Server)
```bash
npm run dev
```
افتح المتصفح على [http://localhost:3000](http://localhost:3000).
