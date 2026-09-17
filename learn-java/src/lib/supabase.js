import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  // eslint-disable-next-line no-console
  console.warn(
    'Variables Supabase manquantes. Copie .env.example vers .env et renseigne ' +
    'VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY (Supabase → Project Settings → API).'
  )
}

export const supabase = createClient(url ?? '', key ?? '')
