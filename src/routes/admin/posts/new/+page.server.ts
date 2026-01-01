import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { getDatabase } from '$lib/server/db';

export const load: PageServerLoad = async ({ platform }) => {
	const db = getDatabase(platform);
	const tags = await db.getAllTags();
	const trips = await db.getAllTrips();
	const categories = await db.getAllCategories();
	return { tags, trips, categories };
};

export const actions: Actions = {
	default: async ({ request, platform }) => {
		const data = await request.formData();
		const title = data.get('title') as string;
		const content = data.get('content') as string;
		const location = data.get('location') as string;
		const excerpt = data.get('excerpt') as string;
		const cover_image = data.get('cover_image') as string;
		const status = data.get('status') as 'draft' | 'published' | 'scheduled';
		const scheduled_for = data.get('scheduled_for') as string;
		const trip_id = data.get('trip_id') as string;
		const category_id = data.get('category_id') as string;
		const latitude = data.get('latitude') as string;
		const longitude = data.get('longitude') as string;
		const video_url = data.get('video_url') as string;
		const tagIds = data.getAll('tags') as string[];
		// Place/Review fields
		const place_name = data.get('place_name') as string;
		const place_address = data.get('place_address') as string;
		const place_phone = data.get('place_phone') as string;
		const place_website = data.get('place_website') as string;
		const place_hours = data.get('place_hours') as string;
		const rating = data.get('rating') as string;
		const price_range = data.get('price_range') as string;

		if (!title || !content) {
			return fail(400, { error: 'Title and content are required' });
		}

		try {
			const db = getDatabase(platform);
			const postId = await db.createPost({
				title,
				content,
				location: location || undefined,
				excerpt: excerpt || undefined,
				cover_image: cover_image || undefined,
				status,
				scheduled_for: scheduled_for || undefined,
				trip_id: trip_id || undefined,
				category_id: category_id || undefined,
				latitude: latitude ? parseFloat(latitude) : undefined,
				longitude: longitude ? parseFloat(longitude) : undefined,
				video_url: video_url || undefined,
				place_name: place_name || undefined,
				place_address: place_address || undefined,
				place_phone: place_phone || undefined,
				place_website: place_website || undefined,
				place_hours: place_hours || undefined,
				rating: rating ? parseInt(rating) : undefined,
				price_range: price_range ? parseInt(price_range) : undefined
			});

			// Add tags
			for (const tagId of tagIds) {
				await db.addTagToPost(postId, tagId);
			}
		} catch (err) {
			return fail(500, { error: 'Failed to create post' });
		}

		throw redirect(302, '/admin/posts');
	}
};
