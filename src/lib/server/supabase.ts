import { createServerClient } from '@supabase/ssr';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '$env/static/private';

export function getSupabaseServer(event: any) {
	return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
		cookies: {
			get: (key) => event.cookies.get(key),
			set: (key, value, options) => {
				event.cookies.set(key, value, { path: '/', ...options });
			},
			remove: (key, options) => {
				event.cookies.delete(key, { path: '/', ...options });
			}
		}
	});
}
