import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { getPhotoBucket } from '$lib/server/db';

export const GET: RequestHandler = async ({ params, platform }) => {
	const bucket = getPhotoBucket(platform);
	const object = await bucket.get(params.filename);

	if (!object) {
		throw error(404, 'Image not found');
	}

	const headers = new Headers();
	
	// Set content type based on file extension
	const ext = params.filename.split('.').pop()?.toLowerCase();
	const contentTypes: Record<string, string> = {
		'jpg': 'image/jpeg',
		'jpeg': 'image/jpeg',
		'png': 'image/png',
		'gif': 'image/gif',
		'webp': 'image/webp',
		'svg': 'image/svg+xml',
		'avif': 'image/avif'
	};
	headers.set('content-type', contentTypes[ext || ''] || 'application/octet-stream');
	
	// Set caching headers
	if (object.httpEtag) {
		headers.set('etag', object.httpEtag);
	}
	headers.set('cache-control', 'public, max-age=31536000');

	return new Response(object.body, {
		headers
	});
};
