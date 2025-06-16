# نظام إدارة المهام - SQLite

نظام شامل لإدارة المهام والعملاء باستخدام Next.js 14 و Prisma مع قاعدة بيانات SQLite.

## المتطلبات

- Node.js 18+ 
- npm أو yarn

## التشغيل

### 1. تثبيت المكتبات
\`\`\`bash
npm install
\`\`\`

### 2. إعداد قاعدة البيانات
\`\`\`bash
# إنشاء مجلد البيانات
mkdir -p data

# تشغيل migration لإنشاء قاعدة البيانات
npx prisma migrate dev --name init

# توليد Prisma Client
npx prisma generate
\`\`\`

### 3. تشغيل المشروع
\`\`\`bash
npm run dev
\`\`\`

افتح [http://localhost:3000](http://localhost:3000) في المتصفح.

## الميزات

- ✅ إدارة العملاء مع تواريخ انتهاء العقود
- ✅ إضافة وإدارة المهام (قصيرة/طويلة المدى)
- ✅ فلترة المهام (اليوم، معلقة، منتهية العقود)
- ✅ تقارير CSV قابلة للتحميل
- ✅ واجهة عربية مع دعم RTL
- ✅ قاعدة بيانات SQLite مدمجة

## هيكل قاعدة البيانات

### جدول العملاء (customers)
- id: معرف فريد
- name: اسم العميل
- contractEnd: تاريخ انتهاء العقد
- createdAt: تاريخ الإنشاء

### جدول المهام (tasks)
- id: معرف فريد
- title: عنوان المهمة
- details: تفاصيل المهمة
- term: مدة المهمة (قصير/طويل)
- employee: اسم الموظف
- done: حالة الإكمال
- createdAt: تاريخ الإنشاء
- customerId: ربط بالعميل

## أوامر مفيدة

\`\`\`bash
# عرض قاعدة البيانات في Prisma Studio
npx prisma studio

# إعادة تعيين قاعدة البيانات
npx prisma migrate reset

# إنشاء migration جديد
npx prisma migrate dev --name migration_name
\`\`\`

## النشر

### Railway
1. ادفع الكود إلى GitHub
2. اربط المشروع بـ Railway
3. أضف متغير البيئة: `DATABASE_URL=file:./data/app.db`

### Render
1. اربط المشروع بـ Render
2. اختر خطة Starter
3. أضف متغير البيئة: `DATABASE_URL=file:./data/app.db`

ملف قاعدة البيانات سيكون محفوظ في `/data/app.db` ومتاح لجميع المستخدمين.
