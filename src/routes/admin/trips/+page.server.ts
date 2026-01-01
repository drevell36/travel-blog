import type { PageServerLoad, Actions } from './$types';
import { getDatabase } from '$lib/server/db';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ platform }) => {
	const db = getDatabase(platform);
	const trips = await db.getAllTrips();
	return { trips };
};

export const actions: Actions = {
	create: async ({ request, platform }) => {
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
		await db.createTrip({
			name,
			description: description || undefined,
			start_date: start_date || undefined,
			end_date: end_date || undefined,
			total_budget: total_budget ? parseFloat(total_budget) : undefined,
			budget_currency: budget_currency || 'USD',
			cover_image: cover_image || undefined
		});
		return { success: true };
	},

	delete: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id') as string;

		if (!id) {
			return fail(400, { error: 'Trip ID is required' });
		}

		const db = getDatabase(platform);
		await db.deleteTrip(id);
		return { success: true };
	}
};
