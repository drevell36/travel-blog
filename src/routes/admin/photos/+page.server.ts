import type { PageServerLoad } from './$types';
import { getDatabase } from '$lib/server/db';

export const load: PageServerLoad = async ({ platform }) => {
	const db = getDatabase(platform);
	const photos = await db.getAllPhotos();
	return { photos };
};
