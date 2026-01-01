import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDatabase } from '$lib/server/db';

export const GET: RequestHandler = async ({ url, platform }) => {
	const query = url.searchParams.get('q')?.trim();
	
	if (!query) {
		return json([]);
	}

	const db = getDatabase(platform);
	const posts = await db.searchPosts(query);

	return json(posts.map(p => ({ id: p.id, title: p.title, slug: p.slug, excerpt: p.excerpt })));
};
