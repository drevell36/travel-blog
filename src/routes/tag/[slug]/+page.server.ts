import type { PageServerLoad } from './$types';
import { getDatabase } from '$lib/server/db';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, platform }) => {
	const db = getDatabase(platform);
	const tag = await db.getTagBySlug(params.slug);
	
	if (!tag) {
		throw error(404, 'Tag not found');
	}

	const posts = await db.getPostsByTag(params.slug);
	return { tag, posts };
};
