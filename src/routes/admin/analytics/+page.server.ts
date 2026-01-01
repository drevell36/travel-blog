import type { PageServerLoad } from './$types';
import { getDatabase } from '$lib/server/db';

export const load: PageServerLoad = async ({ platform, url }) => {
	const db = getDatabase(platform);
	const days = parseInt(url.searchParams.get('days') || '30');
	const analytics = await db.getAnalyticsSummary(days);
	return { analytics, days };
};
