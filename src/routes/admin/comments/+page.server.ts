import type { PageServerLoad, Actions } from './$types';
import { getDatabase } from '$lib/server/db';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ platform, url }) => {
	const db = getDatabase(platform);
	const filter = url.searchParams.get('filter') || 'pending';
	const comments = await db.getAllComments(filter === 'pending');
	return { comments, filter };
};

export const actions: Actions = {
	approve: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id') as string;

		if (!id) {
			return fail(400, { error: 'Comment ID is required' });
		}

		const db = getDatabase(platform);
		await db.approveComment(id);
		return { success: true };
	},

	delete: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id') as string;

		if (!id) {
			return fail(400, { error: 'Comment ID is required' });
		}

		const db = getDatabase(platform);
		await db.deleteComment(id);
		return { success: true };
	}
};
