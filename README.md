# العالمية للحلاقة | Al-Alamiah Barbershop | Uluslararası Berber

نظام حجز مواعيد صالون حلاقة فاخر مبني بتقنيات **Next.js 14 (App Router)**، **Tailwind CSS (Dark Glassmorphism)**، و **Supabase PostgreSQL**.

---

## 🌍 اللغات المدعومة / Supported Languages / Desteklenen Diller
- **العربية (Arabic):** دعم كامل للاتجاه من اليمين إلى اليسار (`RTL`)، تعريب شامل للخدمات، الأوقات، وأسماء المصففين.
- **Türkçe (Turkish):** Tam Türkçe dil desteği, yerelleştirilmiş randevu arayüzü ve saat hesaplaması.
- **English:** Full luxury barbershop styling, terminology, and real-time slot booking.

---

## 🚀 المميزات الرئيسية / Key Features
1. **واجهة فحمية بسيطة:** لوحات زجاجية هادئة، وعناصر تفاعلية مناسبة للأجهزة المحمولة.
2. **حسابات العملاء والحلاقين:** يتطلب تأكيد الحجز تسجيل دخول العميل عبر Supabase Auth، بينما تظل لوحة الحلاق محمية.
3. **حساب التوافر الفعلي للوقت:** حساب أوقات الدوام، فترات الغداء، والعطلات الأسبوعية لكل حلاق تلقائياً.
4. **تعدد اللغات الفوري:** زر مدمج للتحويل بين (العربية / Türkçe / English) مع تبديل تلقائي لاتجاه الصفحة (`dir="rtl"` أو `dir="ltr"`).
5. **أسعار خاصة لكل حلاق:** يمكن للحلاق ضبط أسعار الخدمات من لوحة التحكم.
6. **تحديثات فورية:** تظهر المواعيد الجديدة في لوحة الحلاق باستخدام Supabase Realtime.
7. **منع تداخل المواعيد:** يحسب النظام مدة الخدمة وفترة فاصلة افتراضية قدرها 10 دقائق، مع منع التداخل في PostgreSQL.
8. **قابلية التوسع:** يتضمن المخطط حقول سجل الزيارات وتجهيزات قائمة الانتظار.
9. **لوحة مشرف المنصة:** يمكن للمشرف المعتمد دعوة الحلاقين وإدارة ملفاتهم.

---

## 🛠️ خطوات التشغيل / Getting Started

### 1. تثبيت الحزم (Install Dependencies)
```bash
cd "D:\al-alamiah-barbershop"
npm install
```

### 2. إعداد قاعدة بيانات Supabase (Database Setup)
- شغّل محتويات ملف `supabase/schema.sql` في **SQL Editor** في لوحة تحكم Supabase. المخطط يضيف الجداول والحقول والسياسات دون إسقاط بيانات الحجز الحالية.
- يجهز المخطط جداول `user_roles`, `services`, `barbers`, `barber_services`, `appointments`, و`waitlist_entries`، وسياسات RLS، وتحديثات Realtime.
- تأكد من خلو المواعيد الحالية من التداخل قبل إضافة قيد منع تداخل المواعيد.
- سجّل حساب المالك أولاً، ثم امنحه دور المشرف مرة واحدة من SQL Editor باستبدال البريد:
  ```sql
  INSERT INTO public.user_roles (user_id, role)
  SELECT id, 'admin' FROM auth.users WHERE lower(email) = lower('owner@example.com')
  ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
  ```
- أضف `SUPABASE_SERVICE_ROLE_KEY` إلى `.env.local` كمتغير خادمي فقط؛ لا تستخدم بادئة `NEXT_PUBLIC_` لهذا المفتاح.
- اضبط تأكيد البريد الإلكتروني في Supabase Auth وفق سياسة التسجيل المطلوبة.

### 3. إعداد المتغيرات البيئية (Environment Variables)
قم بإنشاء ملف `.env.local` داخل المجلد:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
```

### 4. تشغيل السيرفر المحلي (Run Development Server)
```bash
npm run dev
```
افتح المتصفح على [http://localhost:3000](http://localhost:3000).
