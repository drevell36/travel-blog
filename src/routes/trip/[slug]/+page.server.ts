import type { PageServerLoad } from './$types';
import { getDatabase } from '$lib/server/db';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, platform }) => {
	const db = getDatabase(platform);
	const trip = await db.getTripBySlug(params.slug);
	
	if (!trip) {
		throw error(404, 'Trip not found');
	}

	const posts = await db.getAllPosts({ tripId: trip.id });
	
	// Calculate total spent from posts
	const totalSpent = posts.reduce((sum, post) => sum + (post.budget_amount || 0), 0);
	
	return { trip, posts, totalSpent };
};
