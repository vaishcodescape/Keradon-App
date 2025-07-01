import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createAuthenticatedClient() {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { session }, error } = await supabase.auth.getSession();
  
  return {
    supabase,
    session,
    error,
    user: session?.user || null,
  };
} 