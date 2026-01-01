import type { PageServerLoad, Actions } from './$types';
import { getDatabase } from '$lib/server/db';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ platform }) => {
	const db = getDatabase(platform);
	const tags = await db.getAllTags();
	return { tags };
};

export const actions: Actions = {
	create: async ({ request, platform }) => {
		const data = await request.formData();
		const name = data.get('name') as string;
		const color = data.get('color') as string;

		if (!name) {
			return fail(400, { error: 'Tag name is required' });
		}

		const db = getDatabase(platform);
		await db.createTag(name, color || undefined);
		return { success: true };
	},

	update: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		const name = data.get('name') as string;
		const color = data.get('color') as string;

		if (!id || !name) {
			return fail(400, { error: 'Tag ID and name are required' });
		}

		const db = getDatabase(platform);
		await db.updateTag(id, { name, color });
		return { success: true };
	},

	delete: async ({ request, platform }) => {
		const data = await request.formData();
		const id = data.get('id') as string;

		if (!id) {
			return fail(400, { error: 'Tag ID is required' });
		}

		const db = getDatabase(platform);
		await db.deleteTag(id);
		return { success: true };
	}
};
