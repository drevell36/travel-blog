import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, platform, locals }) => {
	// Only allow authenticated users
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	try {
		const formData = await request.formData();
		const image = formData.get('image') as File;
		
		if (!image) {
			throw error(400, 'No image provided');
		}

		const imageBuffer = await image.arrayBuffer();

		// Try Cloudflare AI
		if (platform?.env?.AI) {
			try {
				const imageArray = new Uint8Array(imageBuffer);
				const response = await platform.env.AI.run('@cf/llava-hf/llava-1.5-7b-hf', {
					image: [...imageArray],
					prompt: 'Read and transcribe all the text in this image exactly as written. Include all handwritten text. Format it as plain text with line breaks preserved.',
					max_tokens: 1024
				}) as { description?: string };

				const extractedText = response.description || '';
				if (extractedText) {
					return json({ success: true, text: extractedText, engine: 'cloudflare' });
				}
			} catch (e) {
				console.error('Cloudflare AI error:', e);
				throw error(500, `Cloudflare AI failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
			}
		}

		// No engine available
		throw error(503, 'OCR not available. Deploy to Cloudflare to use OCR.');

	} catch (err) {
		console.error('OCR API Error:', err);
		
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		
		throw error(500, `OCR failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
	}
};
