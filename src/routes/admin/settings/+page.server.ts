import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { getDatabase } from '$lib/server/db';
import bcrypt from 'bcryptjs';

export const load: PageServerLoad = async ({ locals, platform }) => {
	const db = getDatabase(platform);
	const settings = await db.getAllSettings();
	return { user: locals.user, settings };
};

export const actions: Actions = {
	updateSettings: async ({ request, platform }) => {
		const data = await request.formData();
		const db = getDatabase(platform);

		await db.updateSettings({
			site_name: data.get('site_name') as string,
			site_description: data.get('site_description') as string,
			site_logo: data.get('site_logo') as string,
			footer_text: data.get('footer_text') as string,
			primary_color: data.get('primary_color') as string,
			default_theme: data.get('default_theme') as 'light' | 'dark' | 'system',
			comments_enabled: data.get('comments_enabled') === 'on',
			reactions_enabled: data.get('reactions_enabled') === 'on',
			notification_email: data.get('notification_email') as string
		});

		return { settingsSuccess: true };
	},

	changePassword: async ({ request, locals, platform }) => {
		const data = await request.formData();
		const currentPassword = data.get('currentPassword') as string;
		const newPassword = data.get('newPassword') as string;
		const confirmPassword = data.get('confirmPassword') as string;

		if (!currentPassword || !newPassword || !confirmPassword) {
			return fail(400, { error: 'All fields are required' });
		}

		if (newPassword !== confirmPassword) {
			return fail(400, { error: 'New passwords do not match' });
		}

		if (newPassword.length < 8) {
			return fail(400, { error: 'Password must be at least 8 characters' });
		}

		const db = getDatabase(platform);
		const user = await db.getUserByUsername(locals.user!.username);

		if (!user || !db.verifyPassword(currentPassword, user.password_hash)) {
			return fail(400, { error: 'Current password is incorrect' });
		}

		// Update password
		const newHash = bcrypt.hashSync(newPassword, 10);
		await db.updateUserPassword(user.id, newHash);

		return { passwordSuccess: true };
	},

	exportData: async ({ platform }) => {
		const db = getDatabase(platform);
		const posts = await db.getAllPosts({ includeUnpublished: true });
		const tags = await db.getAllTags();
		const trips = await db.getAllTrips();
		const categories = await db.getAllCategories();
		const photos = await db.getAllPhotos();
		const settings = await db.getAllSettings();

		const exportData = {
			exportedAt: new Date().toISOString(),
			posts,
			tags,
			trips,
			categories,
			photos,
			settings
		};

		return { exportData: JSON.stringify(exportData, null, 2) };
	}
};
