-- =========================================================================
-- SAYGROUP Talent Assessment — Supabase schema
-- Jalankan file ini sekali di: Supabase Dashboard → SQL Editor → New query
-- =========================================================================

-- ---------------------------------------------------------------------
-- 1. TABEL ADMIN (whitelist siapa saja yang boleh masuk dashboard HR)
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- 2. TABEL SOAL
--    "answer" TIDAK PERNAH boleh dibaca langsung oleh kandidat (anon).
--    Kandidat hanya boleh baca lewat view questions_public (tanpa answer).
-- ---------------------------------------------------------------------
create table if not exists public.questions (
  id text primary key,
  order_no int not null,
  prompt text not null,
  prompt_image text,
  options jsonb not null,       -- array opsi: string | {icon:[...]} | {emoji} | {text,image}
  answer text not null,         -- huruf a-h, RAHASIA
  visual boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- View publik: sama persis TANPA kolom answer
create or replace view public.questions_public as
  select id, order_no, prompt, prompt_image, options, visual
  from public.questions
  order by order_no asc;

-- ---------------------------------------------------------------------
-- 3. TABEL HASIL KANDIDAT
--    Kolom "answers" (jawaban mentah kandidat) & skor HANYA ditulis oleh
--    function submit_test_result (security definer), tidak lewat insert
--    langsung dari client, supaya kandidat tidak bisa memalsukan skor.
-- ---------------------------------------------------------------------
create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position text not null,
  email text,
  answers jsonb not null,
  correct int not null,
  total int not null,
  iq int not null,
  category text not null,
  tone text not null,
  duration_sec int not null,
  report jsonb,                 -- data instrumen tambahan (IST/Focusync/PAPI/MBTI/MSDT), diisi admin
  submitted_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------
alter table public.admins    enable row level security;
alter table public.questions enable row level security;
alter table public.candidates enable row level security;

-- helper: cek apakah user yang login adalah admin
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- admins: hanya admin sendiri yang bisa lihat baris dirinya (opsional dibuka lebih)
create policy "admin can read own row" on public.admins
  for select using (auth.uid() = user_id);

-- questions: tabel asli (dgn jawaban) HANYA boleh dibaca/ditulis admin.
-- Kandidat TIDAK diberi policy select di tabel ini sama sekali —
-- mereka wajib lewat view questions_public.
create policy "admin full access to questions" on public.questions
  for all using (public.is_admin()) with check (public.is_admin());

-- view questions_public: buka akses baca ke publik (anon) lewat grant,
-- bukan lewat RLS (view mewarisi RLS tabel dasar jika security_invoker,
-- jadi kita set security_invoker=false agar view bisa dibaca lepas dari
-- policy tabel questions).
alter view public.questions_public set (security_invoker = false);
grant select on public.questions_public to anon, authenticated;
revoke all on public.questions from anon;

-- candidates: kandidat (anon) TIDAK BOLEH select/update/delete sama sekali,
-- hanya insert lewat function submit_test_result. Admin boleh semua.
create policy "admin full access to candidates" on public.candidates
  for select using (public.is_admin());
create policy "admin can update candidates" on public.candidates
  for update using (public.is_admin()) with check (public.is_admin());
create policy "admin can delete candidates" on public.candidates
  for delete using (public.is_admin());
revoke insert on public.candidates from anon, authenticated;

-- ---------------------------------------------------------------------
-- 5. FUNCTION PENILAIAN (SECURITY DEFINER)
--    Dipanggil dari browser kandidat lewat supabase.rpc('submit_test_result', ...)
--    Menghitung skor di server memakai tabel questions ASLI (dengan jawaban),
--    lalu menyimpan hasil. Browser kandidat tidak pernah melihat kunci jawaban.
-- ---------------------------------------------------------------------
create or replace function public.submit_test_result(
  p_name text,
  p_position text,
  p_email text,
  p_answers jsonb,        -- { "<question_id>": "<letter>", ... }
  p_duration_sec int
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_correct int := 0;
  v_total int := 0;
  v_iq int;
  v_category text;
  v_tone text;
  v_new_id uuid;
  r record;
begin
  for r in select id, answer from public.questions loop
    v_total := v_total + 1;
    if p_answers ->> r.id = r.answer then
      v_correct := v_correct + 1;
    end if;
  end loop;

  if v_total = 0 then v_total := 1; end if;
  v_iq := round(35 + (v_correct::numeric / v_total::numeric) * 130);

  if v_iq < 70 then v_category := 'Sangat Rendah'; v_tone := 'low';
  elsif v_iq < 80 then v_category := 'Rendah'; v_tone := 'low';
  elsif v_iq < 90 then v_category := 'Di Bawah Rata-Rata'; v_tone := 'mid';
  elsif v_iq < 110 then v_category := 'Rata-Rata'; v_tone := 'mid';
  elsif v_iq < 120 then v_category := 'Di Atas Rata-Rata'; v_tone := 'good';
  elsif v_iq < 130 then v_category := 'Superior'; v_tone := 'good';
  elsif v_iq < 145 then v_category := 'Sangat Superior'; v_tone := 'great';
  else v_category := 'Sangat Berbakat'; v_tone := 'great';
  end if;

  insert into public.candidates
    (name, position, email, answers, correct, total, iq, category, tone, duration_sec)
  values
    (p_name, p_position, nullif(p_email, ''), p_answers, v_correct, v_total, v_iq, v_category, v_tone, p_duration_sec)
  returning id into v_new_id;

  -- Sengaja TIDAK mengembalikan skor/IQ ke kandidat, hanya konfirmasi submit.
  return jsonb_build_object('ok', true, 'id', v_new_id);
end;
$$;

revoke all on function public.submit_test_result from public;
grant execute on function public.submit_test_result to anon, authenticated;

-- ---------------------------------------------------------------------
-- 6. CARA MENJADIKAN SEBUAH USER SEBAGAI ADMIN
--    1) Buat user lewat Supabase Dashboard → Authentication → Add user
--       (isi email + password admin HR).
--    2) Jalankan (ganti email-nya):
--       insert into public.admins (user_id, email)
--       select id, email from auth.users where email = 'hr@saygroup.com';
-- ---------------------------------------------------------------------
