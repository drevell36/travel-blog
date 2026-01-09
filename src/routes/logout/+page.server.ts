import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { getSupabaseServer } from '$lib/server/supabase';

export const actions: Actions = {
	default: async ({ event }) => {
		const supabase = getSupabaseServer(event);
		await supabase.auth.signOut();
		throw redirect(302, '/');
	}
};
