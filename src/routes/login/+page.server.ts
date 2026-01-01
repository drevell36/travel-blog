import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { getDatabase } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(302, '/admin');
	}
};

export const actions: Actions = {
	default: async ({ request, cookies, platform }) => {
		const data = await request.formData();
		const username = data.get('username') as string;
		const password = data.get('password') as string;

		if (!username || !password) {
			return fail(400, { error: 'Username and password are required' });
		}

		const db = getDatabase(platform);
		const user = await db.getUserByUsername(username);
		if (!user || !db.verifyPassword(password, user.password_hash)) {
			return fail(400, { error: 'Invalid username or password' });
		}

		const sessionId = await db.createSession(user.id);
		cookies.set('session', sessionId, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: true,
			maxAge: 60 * 60 * 24 * 7 // 7 days
		});

		throw redirect(302, '/admin');
	}
};
