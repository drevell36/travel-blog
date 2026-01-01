import type { LayoutServerLoad } from './$types';
import { getDatabase } from '$lib/server/db';

export const load: LayoutServerLoad = async ({ locals, platform }) => {
	const db = getDatabase(platform);
	const settings = await db.getAllSettings();
	
	return {
		user: locals.user,
		settings
	};
};
