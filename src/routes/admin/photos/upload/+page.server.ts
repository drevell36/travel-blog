import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { getDatabase, getPhotoBucket } from '$lib/server/db';
import { v4 as uuidv4 } from 'uuid';

export const actions: Actions = {
	default: async ({ request, platform }) => {
		const data = await request.formData();
		const photos = data.getAll('photos') as File[];
		const location = data.get('location') as string;

		if (!photos || photos.length === 0 || !photos[0].size) {
			return fail(400, { error: 'Please select at least one photo' });
		}

		try {
			const db = getDatabase(platform);
			const bucket = getPhotoBucket(platform);

			for (const photo of photos) {
				if (photo.size === 0) continue;

				const ext = photo.name.split('.').pop()?.toLowerCase() || 'jpg';
				const filename = `${uuidv4()}.${ext}`;

				// Upload to R2
				const buffer = await photo.arrayBuffer();
				await bucket.put(filename, buffer, {
					httpMetadata: {
						contentType: photo.type
					}
				});

				// Save to database
				await db.addPhoto({
					filename,
					original_name: photo.name,
					location: location || undefined
				});
			}
		} catch (err) {
			console.error('Upload error:', err);
			return fail(500, { error: 'Failed to upload photos' });
		}

		throw redirect(302, '/admin/photos');
	}
};
