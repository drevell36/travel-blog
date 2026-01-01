import type { Actions, PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { getDatabase } from '$lib/server/db';

export const load: PageServerLoad = async ({ params, platform }) => {
	const db = getDatabase(platform);
	const post = await db.getPostById(params.id);

	if (!post) {
		throw error(404, 'Post not found');
	}

	const tags = await db.getAllTags();
	const postTags = await db.getTagsForPost(params.id);
	const trips = await db.getAllTrips();
	const categories = await db.getAllCategories();
	const photos = await db.getAllPhotos();
	const galleryImages = await db.getImagesForPost(params.id);

	return { post, tags, postTags, trips, categories, photos, galleryImages };
};

export const actions: Actions = {
	update: async ({ request, params, platform }) => {
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
			await db.updatePost(params.id, {
				title,
				content,
				location: location || undefined,
				excerpt: excerpt || undefined,
				cover_image: cover_image || undefined,
				status,
				scheduled_for: scheduled_for || null,
				trip_id: trip_id || null,
				category_id: category_id || null,
				latitude: latitude ? parseFloat(latitude) : null,
				longitude: longitude ? parseFloat(longitude) : null,
				video_url: video_url || null,
				place_name: place_name || null,
				place_address: place_address || null,
				place_phone: place_phone || null,
				place_website: place_website || null,
				place_hours: place_hours || null,
				rating: rating ? parseInt(rating) : null,
				price_range: price_range ? parseInt(price_range) : null
			});

			// Update tags
			await db.setPostTags(params.id, tagIds);
		} catch (err) {
			return fail(500, { error: 'Failed to update post' });
		}

		return { success: true };
	},

	addGalleryImage: async ({ request, params, platform }) => {
		const data = await request.formData();
		const photo_id = data.get('photo_id') as string;

		if (!photo_id) {
			return fail(400, { error: 'Photo is required' });
		}

		const db = getDatabase(platform);
		await db.addImageToPost(params.id, photo_id);
		return { success: true };
	},

	removeGalleryImage: async ({ request, params, platform }) => {
		const data = await request.formData();
		const photo_id = data.get('photo_id') as string;

		const db = getDatabase(platform);
		await db.removeImageFromPost(params.id, photo_id);
		return { success: true };
	},

	delete: async ({ params, platform }) => {
		try {
			const db = getDatabase(platform);
			await db.deletePost(params.id);
		} catch (err) {
			return fail(500, { error: 'Failed to delete post' });
		}

		throw redirect(302, '/admin/posts');
	}
};
