import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { getSupabaseServer } from '$lib/server/supabase';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(302, '/admin');
	}
};

export const actions: Actions = {
	default: async ({ request, locals, cookies, getClientAddress }) => {
		const event = { cookies, getClientAddress } as any; // Create event-like object for Supabase
		const data = await request.formData();
		const email = data.get('email') as string;
		const password = data.get('password') as string;

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required' });
		}

		try {
			const supabase = getSupabaseServer(event);

			const { data: authData, error } = await supabase.auth.signInWithPassword({
				email,
				password
			});

			if (error || !authData.session) {
				return fail(400, { error: error?.message || 'Invalid credentials' });
			}

			throw redirect(302, '/admin');
		} catch (e) {
			if (e instanceof Error && e.message.includes('302')) {
				throw e;
			}
			return fail(500, { error: 'Authentication failed' });
		}
	}
};
