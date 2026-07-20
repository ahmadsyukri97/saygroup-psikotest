# SAYGROUP Talent Assessment — HTML/JS + Supabase

Versi statis (HTML/CSS/JS murni, tanpa build step) dari aplikasi tes bakat.
Bisa di-deploy langsung ke **GitHub Pages**. Data (soal & hasil kandidat)
disimpan di **Supabase** (Postgres gratis) supaya bisa diakses admin dari
perangkat mana pun.

## Perbaikan keamanan dari versi sebelumnya
- **Tidak ada PIN hardcoded lagi.** Admin login pakai email+password sungguhan
  (Supabase Auth), dicek server-side lewat tabel `admins`.
- **Kunci jawaban tidak pernah dikirim ke browser kandidat.** Kandidat hanya
  mengambil data dari `questions_public` (tanpa kolom `answer`). Penilaian
  dihitung di server lewat Postgres function `submit_test_result`
  (`security definer`), yang juga satu-satunya cara baris `candidates` bisa
  dibuat — kandidat tidak bisa memalsukan skornya sendiri.

> 🖼️ **Bingung dengan langkah Supabase-nya?** Buka `PANDUAN-VISUAL-SETUP.html`
> di folder ini — ada mockup layar dashboard yang menandai persis tombol/menu
> mana yang harus diklik di tiap langkah, plus solusi untuk error yang paling
> sering muncul.

## 1. Setup Supabase (gratis)

1. Buat akun & project baru di [supabase.com](https://supabase.com).
2. Buka **SQL Editor** → New query → tempel isi `supabase/schema.sql` → Run.
3. Tempel isi `supabase/seed-questions.sql` → Run (mengisi 60 soal starter).
4. Buka **Authentication → Users → Add user**, buat akun admin HR pertama
   (isi email & password).
5. Kembali ke **SQL Editor**, jalankan (ganti email sesuai user yang dibuat):
   ```sql
   insert into public.admins (user_id, email)
   select id, email from auth.users where email = 'hr@perusahaan-anda.com';
   ```
6. Buka **Project Settings → API**, salin **Project URL** dan **anon public key**.

## 2. Konfigurasi frontend

Edit `js/config.js`:
```js
const SUPABASE_URL = "https://xxxxxxxx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGci...";
```
`anon key` aman ditaruh di kode publik — semua akses dibatasi oleh Row Level
Security yang sudah diatur di `schema.sql`.

## 3. Coba lokal

Cukup buka `index.html` lewat static server apa saja, misalnya:
```bash
npx serve .
# atau
python3 -m http.server
```
(Tidak bisa dibuka langsung via `file://` karena browser modern memblokir
beberapa request untuk file lokal.)

## 4. Deploy ke GitHub Pages

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```
Lalu di GitHub: **Settings → Pages → Source: Deploy from branch → main / (root)**.
Situs akan aktif di `https://USERNAME.github.io/REPO/`.

> ⚠️ Karena `js/config.js` berisi anon key, pastikan repo memang dimaksudkan
> publik/aman untuk itu (anon key + RLS memang didesain aman untuk publik,
> tapi tetap review kembali policy di `schema.sql` sesuai kebutuhanmu).

## Struktur proyek

```
index.html
css/styles.css
js/
  config.js            <- isi kredensial Supabase di sini
  supabaseClient.js
  shapes.js            <- render opsi soal berbentuk ikon/emoji
  charts.js            <- SVG line chart & radar chart utk laporan
  report-data.js        <- data model IST/PAPI/MBTI/MSDT
  report.js             <- generator HTML laporan 11 halaman (utk print/PDF)
  app.js                 <- landing, form kandidat, tes, submit
  app-admin.js            <- login admin, dashboard, detail kandidat
  app-question-editor.js  <- CRUD bank soal
  app-report-editor.js    <- form isi laporan instrumen + preview/print PDF
supabase/
  schema.sql            <- jalankan sekali di SQL Editor
  seed-questions.sql    <- 60 soal starter
```

## Keterbatasan yang perlu kamu tahu

- **Opsi soal bergambar (icon-set)** dari bank soal starter (mis. soal pola
  bentuk) saat ini hanya bisa diedit lewat Supabase Table Editor langsung
  (kolom `options`, format JSON), belum ada UI khusus di editor soal.
  Menambah soal baru dengan opsi teks/emoji sudah didukung penuh dari UI.
- **Export PDF** memakai `window.print()` bawaan browser (pilih "Save as PDF"
  di dialog cetak) — hasilnya sama seperti contoh yang sudah saya kirim
  sebelumnya, bukan generate PDF di server.
- Skema RLS mengasumsikan satu tabel `admins` sebagai whitelist. Untuk
  menambah admin baru, ulangi langkah 4–5 di atas untuk user tersebut.
