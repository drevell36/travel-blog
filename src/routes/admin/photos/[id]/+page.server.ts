import type { Actions, PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { getDatabase, getPhotoBucket } from '$lib/server/db';

export const load: PageServerLoad = async ({ params, platform }) => {
	const db = getDatabase(platform);
	const photo = await db.getPhotoById(params.id);

	if (!photo) {
		throw error(404, 'Photo not found');
	}

	const posts = await db.getAllPosts({ includeUnpublished: true });

	return { photo, posts };
};

export const actions: Actions = {
	update: async ({ request, params, platform }) => {
		const data = await request.formData();
		const caption = data.get('caption') as string;
		const location = data.get('location') as string;
		const post_id = data.get('post_id') as string;

		try {
			const db = getDatabase(platform);
			await db.updatePhoto(params.id, {
				caption: caption || undefined,
				location: location || undefined,
				post_id: post_id || null
			});
		} catch (err) {
			return fail(500, { error: 'Failed to update photo' });
		}

		return { success: true };
	},

	delete: async ({ params, platform }) => {
		try {
			const db = getDatabase(platform);
			const bucket = getPhotoBucket(platform);
			const photo = await db.getPhotoById(params.id);
			if (photo) {
				// Delete from R2
				await bucket.delete(photo.filename);
				// Delete from database
				await db.deletePhoto(params.id);
			}
		} catch (err) {
			return fail(500, { error: 'Failed to delete photo' });
		}

		throw redirect(302, '/admin/photos');
	}
};
