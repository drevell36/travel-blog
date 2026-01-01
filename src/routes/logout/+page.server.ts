import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { getDatabase } from '$lib/server/db';

export const actions: Actions = {
	default: async ({ cookies, platform }) => {
		const sessionId = cookies.get('session');
		if (sessionId) {
			const db = getDatabase(platform);
			await db.deleteSession(sessionId);
		}
		cookies.delete('session', { path: '/' });
		throw redirect(302, '/');
	}
};
