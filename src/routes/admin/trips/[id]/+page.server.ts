import type { PageServerLoad, Actions } from './$types';
import { getDatabase } from '$lib/server/db';
import { fail, redirect, error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, platform }) => {
	const db = getDatabase(platform);
	const trip = await db.getTripById(params.id);
	
	if (!trip) {
		throw error(404, 'Trip not found');
	}

	const posts = await db.getAllPosts({ includeUnpublished: true, tripId: params.id });
	
	return { trip, posts };
};

export const actions: Actions = {
	update: async ({ request, platform, params }) => {
		const data = await request.formData();
		const name = data.get('name') as string;
		const description = data.get('description') as string;
		const start_date = data.get('start_date') as string;
		const end_date = data.get('end_date') as string;
		const total_budget = data.get('total_budget') as string;
		const budget_currency = data.get('budget_currency') as string;
		const cover_image = data.get('cover_image') as string;

		if (!name) {
			return fail(400, { error: 'Trip name is required' });
		}

		const db = getDatabase(platform);
		await db.updateTrip(params.id, {
			name,
			description: description || null,
			start_date: start_date || null,
			end_date: end_date || null,
			total_budget: total_budget ? parseFloat(total_budget) : null,
			budget_currency: budget_currency || 'USD',
			cover_image: cover_image || null
		});
		return { success: true };
	},

	delete: async ({ platform, params }) => {
		const db = getDatabase(platform);
		await db.deleteTrip(params.id);
		throw redirect(302, '/admin/trips');
	}
};
