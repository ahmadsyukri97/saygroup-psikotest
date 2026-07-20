// Membutuhkan <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
// dimuat lebih dulu di index.html (menyediakan window.supabase.createClient).
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
