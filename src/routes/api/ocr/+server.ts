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
		const imageArray = new Uint8Array(imageBuffer);
		
		// Convert to base64
		let binary = '';
		for (let i = 0; i < imageArray.byteLength; i++) {
			binary += String.fromCharCode(imageArray[i]);
		}
		const base64Image = btoa(binary);

		// Use Google Vision API
		const googleApiKey = platform?.env?.GOOGLE_VISION_API_KEY;
		if (!googleApiKey) {
			throw error(503, 'OCR not available - Google Vision API key not configured');
		}

		const response = await fetch(
			`https://vision.googleapis.com/v1/images:annotate?key=${googleApiKey}`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					requests: [{
						image: { content: base64Image },
						features: [{ type: 'DOCUMENT_TEXT_DETECTION' }]
					}]
				})
			}
		);

		if (!response.ok) {
			const errText = await response.text();
			console.error('Google Vision error:', errText);
			throw error(500, `Google Vision API error: ${response.status}`);
		}

		const data = await response.json() as {
			responses?: Array<{
				fullTextAnnotation?: { text: string };
				error?: { message: string };
			}>;
		};

		if (data.responses?.[0]?.error) {
			throw error(500, data.responses[0].error.message);
		}

		const extractedText = data.responses?.[0]?.fullTextAnnotation?.text || '';
		
		if (extractedText.trim()) {
			return json({ success: true, text: extractedText, engine: 'google' });
		}
		
		return json({ success: true, text: 'No text detected in image.', engine: 'google' });

	} catch (err) {
		console.error('OCR API Error:', err);
		
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		
		throw error(500, `OCR failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
	}
};
