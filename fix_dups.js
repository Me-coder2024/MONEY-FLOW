import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function run() {
  const { data: founders } = await supabase.from('founders').select('*')
  console.log('Founders:', founders)
  
  // Find dupes by email + workspace
  const map = {}
  for (const f of founders || []) {
    const key = f.email + '|' + f.user_id
    if (!map[key]) map[key] = []
    map[key].push(f)
  }
  
  for (const key in map) {
    if (map[key].length > 1) {
      // keep the first one
      const toDelete = map[key].slice(1)
      for (const f of toDelete) {
        console.log('Deleting duplicate founder ID:', f.id)
        await supabase.from('founders').delete().eq('id', f.id)
      }
    }
  }
}

run()
