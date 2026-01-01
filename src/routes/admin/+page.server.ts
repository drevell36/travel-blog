import type { PageServerLoad } from './$types';
import { getDatabase } from '$lib/server/db';

export const load: PageServerLoad = async ({ platform }) => {
	const db = getDatabase(platform);
	const posts = await db.getAllPosts(true);
	const photos = await db.getAllPhotos();

	return {
		stats: {
			totalPosts: posts.length,
			publishedPosts: posts.filter(p => p.published).length,
			totalPhotos: photos.length
		}
	};
};
