import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getDatabase } from '$lib/server/db';

export const load: PageServerLoad = async ({ params, platform }) => {
	const db = getDatabase(platform);
	const category = await db.getCategoryBySlug(params.slug);

	if (!category) {
		throw error(404, 'Category not found');
	}

	const posts = await db.getPostsByCategory(params.slug);
	return { category, posts };
};
