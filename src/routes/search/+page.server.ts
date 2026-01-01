import type { PageServerLoad } from './$types';
import { getDatabase } from '$lib/server/db';

export const load: PageServerLoad = async ({ platform, url }) => {
	const query = url.searchParams.get('q') || '';
	
	if (!query) {
		return { query, posts: [] };
	}

	const db = getDatabase(platform);
	const posts = await db.searchPosts(query);
	return { query, posts };
};
