# PlayStation Shop Manager — Vercel + Supabase Deploy Guide

## الهيكل

```
ps-shop-manager/
├── api/
│   └── store.js          ← Vercel serverless function (كل الـ API هنا)
├── public/
│   └── index.html        ← الواجهة الكاملة
├── supabase/
│   └── schema.sql        ← شغّله مرة واحدة في Supabase
├── vercel.json           ← routing config
├── package.json
└── .env.example
```

---

## الخطوة 1 — Supabase (قاعدة البيانات)

1. روح [supabase.com](https://supabase.com) وافتح مشروع جديد
2. من الـ sidebar اضغط **SQL Editor**
3. انسخ محتوى ملف `supabase/schema.sql` والصقه واضغط **Run**
4. روح **Settings → API**:
   - انسخ **Project URL** → هيبقى `SUPABASE_URL`
   - انسخ **service_role** key (مش anon) → هيبقى `SUPABASE_KEY`

---

## الخطوة 2 — Vercel (الـ hosting)

### طريقة GitHub (الأسهل):
1. ارفع المجلد ده على GitHub repo جديد
2. روح [vercel.com](https://vercel.com) → **New Project** → import الـ repo
3. في **Environment Variables** أضف:
   ```
   SUPABASE_URL = https://xxxx.supabase.co
   SUPABASE_KEY = eyJhbGci...  (service_role key)
   ```
4. اضغط **Deploy** — خلاص!

### طريقة Vercel CLI:
```bash
npm i -g vercel
vercel
# يسألك عن الـ env variables، ادخلهم
```

---

## الخطوة 3 — تجربة الموقع

- افتح الـ URL اللي Vercel طلعه
- سجل دخول بـ `admin` / `admin123`
- كل البيانات بتتحفظ على Supabase تلقائياً

---

## ملاحظات مهمة

- **service_role key** — مش anon key، لأنه بيتجاوز الـ RLS ويكتب بدون قيود
- الـ key ده سري، متحطوش في الـ frontend أبداً — بس في Vercel env variables
- الـ `public/index.html` بيكلم `/api/key` relative، Vercel بيوجهها لـ `api/store.js`
