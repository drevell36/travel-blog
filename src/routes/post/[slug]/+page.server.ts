import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import { getDatabase } from '$lib/server/db';

export const load: PageServerLoad = async ({ params, platform, cookies, request }) => {
	const db = getDatabase(platform);
	const post = await db.getPostBySlug(params.slug);

	if (!post) {
		throw error(404, 'Post not found');
	}

	// Get related data
	const photos = await db.getPhotosByPostId(post.id);
	const galleryImages = await db.getImagesForPost(post.id);
	const tags = await db.getTagsForPost(post.id);
	const comments = await db.getCommentsForPost(post.id);
	const likeCount = await db.getLikeCount(post.id);

	// Check if visitor has liked
	let visitorId = cookies.get('visitor_id');
	if (!visitorId) {
		visitorId = crypto.randomUUID();
		cookies.set('visitor_id', visitorId, { path: '/', maxAge: 60 * 60 * 24 * 365 });
	}
	const hasLiked = await db.hasLiked(post.id, visitorId);

	// Get reactions
	const reactions = await db.getReactionsForPost(post.id);
	const visitorReactions = await db.getVisitorReactions(post.id, visitorId);

	// Get related posts
	const relatedPosts = await db.getRelatedPosts(post.id, 4);

	// Get category
	let category = null;
	if (post.category_id) {
		category = await db.getCategoryById(post.category_id);
	}

	// Track page view
	try {
		await db.recordPageView({
			page_path: `/post/${params.slug}`,
			post_id: post.id,
			visitor_id: visitorId,
			referrer: request.headers.get('referer') || undefined,
			user_agent: request.headers.get('user-agent') || undefined
		});
		await db.incrementViewCount(post.id);
	} catch (e) {
		// Don't fail page load if analytics fails
	}

	// Get trip if exists
	let trip = null;
	if (post.trip_id) {
		trip = await db.getTripById(post.trip_id);
	}

	// Get settings for comments/reactions
	const settings = await db.getAllSettings();

	return { post, photos, galleryImages, tags, comments, likeCount, hasLiked, trip, reactions, visitorReactions, relatedPosts, category, settings };
};

export const actions: Actions = {
	like: async ({ params, platform, cookies }) => {
		const visitorId = cookies.get('visitor_id');
		if (!visitorId) {
			return fail(400, { error: 'Could not record like' });
		}

		const db = getDatabase(platform);
		const post = await db.getPostBySlug(params.slug);
		if (!post) {
			return fail(404, { error: 'Post not found' });
		}

		const hasLiked = await db.hasLiked(post.id, visitorId);
		if (hasLiked) {
			await db.removeLike(post.id, visitorId);
		} else {
			await db.addLike(post.id, visitorId);
		}

		return { success: true };
	},

	react: async ({ request, params, platform, cookies }) => {
		const visitorId = cookies.get('visitor_id');
		if (!visitorId) {
			return fail(400, { error: 'Could not record reaction' });
		}

		const data = await request.formData();
		const emoji = data.get('emoji') as string;

		if (!emoji) {
			return fail(400, { error: 'Emoji is required' });
		}

		const db = getDatabase(platform);
		const post = await db.getPostBySlug(params.slug);
		if (!post) {
			return fail(404, { error: 'Post not found' });
		}

		await db.toggleReaction(post.id, visitorId, emoji);
		return { success: true };
	},

	comment: async ({ request, params, platform }) => {
		const data = await request.formData();
		const author_name = data.get('author_name') as string;
		const author_email = data.get('author_email') as string;
		const content = data.get('content') as string;

		if (!author_name || !content) {
			return fail(400, { commentError: 'Name and comment are required' });
		}

		const db = getDatabase(platform);
		const post = await db.getPostBySlug(params.slug);
		if (!post) {
			return fail(404, { commentError: 'Post not found' });
		}

		await db.createComment({
			post_id: post.id,
			author_name,
			author_email: author_email || undefined,
			content
		});

		return { commentSuccess: true };
	}
};
