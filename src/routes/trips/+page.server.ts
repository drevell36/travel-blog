import type { PageServerLoad } from './$types';
import { getDatabase } from '$lib/server/db';

export const load: PageServerLoad = async ({ platform }) => {
	const db = getDatabase(platform);
	const trips = await db.getAllTrips();

	// Get post counts for each trip
	const tripsWithCounts = await Promise.all(
		trips.map(async (trip) => {
			const posts = await db.getPostsByTrip(trip.id);
			return {
				...trip,
				postCount: posts.length
			};
		})
	);

	return { trips: tripsWithCounts };
};
