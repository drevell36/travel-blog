/// <reference types="@cloudflare/workers-types" />
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// Types
export interface Post {
	id: string;
	title: string;
	slug: string;
	content: string;
	excerpt: string | null;
	location: string | null;
	cover_image: string | null;
	published: number;
	status: 'draft' | 'published' | 'scheduled';
	scheduled_for: string | null;
	trip_id: string | null;
	category_id: string | null;
	latitude: number | null;
	longitude: number | null;
	video_url: string | null;
	budget_amount: number | null;
	budget_currency: string;
	locale: string;
	view_count: number;
	// Review/Place fields
	place_name: string | null;
	place_address: string | null;
	place_phone: string | null;
	place_website: string | null;
	place_hours: string | null;
	rating: number | null;
	price_range: number | null;
	created_at: string;
	updated_at: string;
}

export interface Photo {
	id: string;
	filename: string;
	original_name: string;
	caption: string | null;
	location: string | null;
	post_id: string | null;
	created_at: string;
}

export interface User {
	id: string;
	username: string;
	password_hash: string;
}

export interface Session {
	id: string;
	user_id: string;
	username: string;
	expires_at: string;
}

export interface Tag {
	id: string;
	name: string;
	slug: string;
	color: string;
	created_at: string;
}

export interface Trip {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	cover_image: string | null;
	start_date: string | null;
	end_date: string | null;
	total_budget: number | null;
	budget_currency: string;
	created_at: string;
}

export interface Comment {
	id: string;
	post_id: string;
	author_name: string;
	author_email: string | null;
	content: string;
	approved: number;
	created_at: string;
}

export interface Like {
	id: string;
	post_id: string;
	visitor_id: string;
	created_at: string;
}

export interface PageView {
	id: string;
	page_path: string;
	post_id: string | null;
	visitor_id: string | null;
	referrer: string | null;
	user_agent: string | null;
	country: string | null;
	created_at: string;
}

export interface PostImage {
	id: string;
	post_id: string;
	photo_id: string;
	sort_order: number;
}

export interface Category {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	icon: string;
	sort_order: number;
	created_at: string;
}

export interface Reaction {
	id: string;
	post_id: string;
	visitor_id: string;
	emoji: string;
	created_at: string;
}

export interface Setting {
	key: string;
	value: string;
	updated_at: string;
}

export interface SiteSettings {
	site_name: string;
	site_description: string;
	site_logo: string;
	footer_text: string;
	primary_color: string;
	default_theme: 'light' | 'dark' | 'system';
	comments_enabled: boolean;
	reactions_enabled: boolean;
	notification_email: string;
}

// Database helper class that wraps D1
export class Database {
	constructor(private db: D1Database) {}

	// ============ USER FUNCTIONS ============
	async createUser(username: string, password: string) {
		const id = uuidv4();
		const password_hash = bcrypt.hashSync(password, 10);
		await this.db.prepare('INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)')
			.bind(id, username, password_hash)
			.run();
		return id;
	}

	async getUserByUsername(username: string) {
		const result = await this.db.prepare('SELECT * FROM users WHERE username = ?')
			.bind(username)
			.first<User>();
		return result;
	}

	async updateUserPassword(userId: string, newPasswordHash: string) {
		await this.db.prepare('UPDATE users SET password_hash = ? WHERE id = ?')
			.bind(newPasswordHash, userId)
			.run();
	}

	verifyPassword(password: string, hash: string) {
		return bcrypt.compareSync(password, hash);
	}

	// ============ SESSION FUNCTIONS ============
	async createSession(userId: string) {
		const id = uuidv4();
		const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
		await this.db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)')
			.bind(id, userId, expiresAt)
			.run();
		return id;
	}

	async getSession(sessionId: string) {
		const result = await this.db.prepare(`
			SELECT s.*, u.username 
			FROM sessions s 
			JOIN users u ON s.user_id = u.id 
			WHERE s.id = ? AND s.expires_at > datetime('now')
		`).bind(sessionId).first<Session>();
		return result;
	}

	async deleteSession(sessionId: string) {
		await this.db.prepare('DELETE FROM sessions WHERE id = ?')
			.bind(sessionId)
			.run();
	}

	// ============ POST FUNCTIONS ============
	async createPost(data: { 
		title: string; 
		content: string; 
		excerpt?: string; 
		location?: string; 
		cover_image?: string; 
		published?: boolean;
		status?: 'draft' | 'published' | 'scheduled';
		scheduled_for?: string;
		trip_id?: string;
		category_id?: string;
		latitude?: number;
		longitude?: number;
		video_url?: string;
		budget_amount?: number;
		budget_currency?: string;
		locale?: string;
		place_name?: string;
		place_address?: string;
		place_phone?: string;
		place_website?: string;
		place_hours?: string;
		rating?: number;
		price_range?: number;
	}) {
		const id = uuidv4();
		const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
		const status = data.status || (data.published ? 'published' : 'draft');
		
		await this.db.prepare(`
			INSERT INTO posts (id, title, slug, content, excerpt, location, cover_image, published, status, scheduled_for, trip_id, category_id, latitude, longitude, video_url, budget_amount, budget_currency, locale, place_name, place_address, place_phone, place_website, place_hours, rating, price_range)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`).bind(
			id, 
			data.title, 
			slug, 
			data.content, 
			data.excerpt || null, 
			data.location || null, 
			data.cover_image || null, 
			status === 'published' ? 1 : 0,
			status,
			data.scheduled_for || null,
			data.trip_id || null,
			data.category_id || null,
			data.latitude || null,
			data.longitude || null,
			data.video_url || null,
			data.budget_amount || null,
			data.budget_currency || 'USD',
			data.locale || 'en',
			data.place_name || null,
			data.place_address || null,
			data.place_phone || null,
			data.place_website || null,
			data.place_hours || null,
			data.rating || null,
			data.price_range || null
		).run();
		return id;
	}

	async updatePost(id: string, data: { 
		title?: string; 
		content?: string; 
		excerpt?: string; 
		location?: string; 
		cover_image?: string; 
		published?: boolean;
		status?: 'draft' | 'published' | 'scheduled';
		scheduled_for?: string | null;
		trip_id?: string | null;
		category_id?: string | null;
		latitude?: number | null;
		longitude?: number | null;
		video_url?: string | null;
		budget_amount?: number | null;
		budget_currency?: string;
		locale?: string;
		place_name?: string | null;
		place_address?: string | null;
		place_phone?: string | null;
		place_website?: string | null;
		place_hours?: string | null;
		rating?: number | null;
		price_range?: number | null;
	}) {
		const updates: string[] = [];
		const values: (string | number | null)[] = [];

		if (data.title !== undefined) {
			updates.push('title = ?');
			values.push(data.title);
			updates.push('slug = ?');
			values.push(data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
		}
		if (data.content !== undefined) {
			updates.push('content = ?');
			values.push(data.content);
		}
		if (data.excerpt !== undefined) {
			updates.push('excerpt = ?');
			values.push(data.excerpt);
		}
		if (data.location !== undefined) {
			updates.push('location = ?');
			values.push(data.location);
		}
		if (data.cover_image !== undefined) {
			updates.push('cover_image = ?');
			values.push(data.cover_image);
		}
		if (data.published !== undefined) {
			updates.push('published = ?');
			values.push(data.published ? 1 : 0);
		}
		if (data.status !== undefined) {
			updates.push('status = ?');
			values.push(data.status);
			updates.push('published = ?');
			values.push(data.status === 'published' ? 1 : 0);
		}
		if (data.scheduled_for !== undefined) {
			updates.push('scheduled_for = ?');
			values.push(data.scheduled_for);
		}
		if (data.trip_id !== undefined) {
			updates.push('trip_id = ?');
			values.push(data.trip_id);
		}
		if (data.latitude !== undefined) {
			updates.push('latitude = ?');
			values.push(data.latitude);
		}
		if (data.longitude !== undefined) {
			updates.push('longitude = ?');
			values.push(data.longitude);
		}
		if (data.video_url !== undefined) {
			updates.push('video_url = ?');
			values.push(data.video_url);
		}
		if (data.budget_amount !== undefined) {
			updates.push('budget_amount = ?');
			values.push(data.budget_amount);
		}
		if (data.budget_currency !== undefined) {
			updates.push('budget_currency = ?');
			values.push(data.budget_currency);
		}
		if (data.locale !== undefined) {
			updates.push('locale = ?');
			values.push(data.locale);
		}
		if (data.category_id !== undefined) {
			updates.push('category_id = ?');
			values.push(data.category_id);
		}
		if (data.place_name !== undefined) {
			updates.push('place_name = ?');
			values.push(data.place_name);
		}
		if (data.place_address !== undefined) {
			updates.push('place_address = ?');
			values.push(data.place_address);
		}
		if (data.place_phone !== undefined) {
			updates.push('place_phone = ?');
			values.push(data.place_phone);
		}
		if (data.place_website !== undefined) {
			updates.push('place_website = ?');
			values.push(data.place_website);
		}
		if (data.place_hours !== undefined) {
			updates.push('place_hours = ?');
			values.push(data.place_hours);
		}
		if (data.rating !== undefined) {
			updates.push('rating = ?');
			values.push(data.rating);
		}
		if (data.price_range !== undefined) {
			updates.push('price_range = ?');
			values.push(data.price_range);
		}

		updates.push('updated_at = CURRENT_TIMESTAMP');
		values.push(id);

		await this.db.prepare(`UPDATE posts SET ${updates.join(', ')} WHERE id = ?`)
			.bind(...values)
			.run();
	}

	async deletePost(id: string) {
		await this.db.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
	}

	async getPostById(id: string) {
		return await this.db.prepare('SELECT * FROM posts WHERE id = ?')
			.bind(id)
			.first<Post>();
	}

	async getPostBySlug(slug: string) {
		return await this.db.prepare('SELECT * FROM posts WHERE slug = ? AND status = ?')
			.bind(slug, 'published')
			.first<Post>();
	}

	async getAllPosts(options: { includeUnpublished?: boolean; status?: string; tripId?: string; locale?: string } = {}) {
		let query = 'SELECT * FROM posts WHERE 1=1';
		const params: (string | number)[] = [];

		if (!options.includeUnpublished) {
			query += ' AND status = ?';
			params.push('published');
		}
		if (options.status) {
			query += ' AND status = ?';
			params.push(options.status);
		}
		if (options.tripId) {
			query += ' AND trip_id = ?';
			params.push(options.tripId);
		}
		if (options.locale) {
			query += ' AND locale = ?';
			params.push(options.locale);
		}

		query += ' ORDER BY created_at DESC';

		const stmt = this.db.prepare(query);
		const result = params.length > 0 
			? await stmt.bind(...params).all<Post>()
			: await stmt.all<Post>();
		return result.results;
	}

	async getScheduledPosts() {
		const result = await this.db.prepare(`
			SELECT * FROM posts 
			WHERE status = 'scheduled' AND scheduled_for <= datetime('now')
			ORDER BY scheduled_for ASC
		`).all<Post>();
		return result.results;
	}

	async publishScheduledPosts() {
		await this.db.prepare(`
			UPDATE posts 
			SET status = 'published', published = 1, updated_at = CURRENT_TIMESTAMP
			WHERE status = 'scheduled' AND scheduled_for <= datetime('now')
		`).run();
	}

	async incrementViewCount(postId: string) {
		await this.db.prepare('UPDATE posts SET view_count = view_count + 1 WHERE id = ?')
			.bind(postId)
			.run();
	}

	async searchPosts(query: string) {
		const searchTerm = `%${query}%`;
		const result = await this.db.prepare(`
			SELECT * FROM posts 
			WHERE status = 'published' AND (title LIKE ? OR content LIKE ? OR excerpt LIKE ? OR location LIKE ?)
			ORDER BY created_at DESC
		`).bind(searchTerm, searchTerm, searchTerm, searchTerm).all<Post>();
		return result.results;
	}

	// ============ TAG FUNCTIONS ============
	async createTag(name: string, color?: string) {
		const id = uuidv4();
		const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
		await this.db.prepare('INSERT INTO tags (id, name, slug, color) VALUES (?, ?, ?, ?)')
			.bind(id, name, slug, color || '#3b82f6')
			.run();
		return id;
	}

	async updateTag(id: string, data: { name?: string; color?: string }) {
		const updates: string[] = [];
		const values: string[] = [];

		if (data.name) {
			updates.push('name = ?', 'slug = ?');
			values.push(data.name, data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
		}
		if (data.color) {
			updates.push('color = ?');
			values.push(data.color);
		}

		values.push(id);
		await this.db.prepare(`UPDATE tags SET ${updates.join(', ')} WHERE id = ?`)
			.bind(...values)
			.run();
	}

	async deleteTag(id: string) {
		await this.db.prepare('DELETE FROM tags WHERE id = ?').bind(id).run();
	}

	async getAllTags() {
		const result = await this.db.prepare('SELECT * FROM tags ORDER BY name ASC').all<Tag>();
		return result.results;
	}

	async getTagBySlug(slug: string) {
		return await this.db.prepare('SELECT * FROM tags WHERE slug = ?')
			.bind(slug)
			.first<Tag>();
	}

	async addTagToPost(postId: string, tagId: string) {
		await this.db.prepare('INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)')
			.bind(postId, tagId)
			.run();
	}

	async removeTagFromPost(postId: string, tagId: string) {
		await this.db.prepare('DELETE FROM post_tags WHERE post_id = ? AND tag_id = ?')
			.bind(postId, tagId)
			.run();
	}

	async getTagsForPost(postId: string) {
		const result = await this.db.prepare(`
			SELECT t.* FROM tags t
			JOIN post_tags pt ON t.id = pt.tag_id
			WHERE pt.post_id = ?
			ORDER BY t.name ASC
		`).bind(postId).all<Tag>();
		return result.results;
	}

	async getPostsByTag(tagSlug: string) {
		const result = await this.db.prepare(`
			SELECT p.* FROM posts p
			JOIN post_tags pt ON p.id = pt.post_id
			JOIN tags t ON pt.tag_id = t.id
			WHERE t.slug = ? AND p.status = 'published'
			ORDER BY p.created_at DESC
		`).bind(tagSlug).all<Post>();
		return result.results;
	}

	async setPostTags(postId: string, tagIds: string[]) {
		await this.db.prepare('DELETE FROM post_tags WHERE post_id = ?').bind(postId).run();
		for (const tagId of tagIds) {
			await this.addTagToPost(postId, tagId);
		}
	}

	// ============ TRIP FUNCTIONS ============
	async createTrip(data: { 
		name: string; 
		description?: string; 
		cover_image?: string; 
		start_date?: string; 
		end_date?: string;
		total_budget?: number;
		budget_currency?: string;
	}) {
		const id = uuidv4();
		const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
		await this.db.prepare(`
			INSERT INTO trips (id, name, slug, description, cover_image, start_date, end_date, total_budget, budget_currency)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
		`).bind(
			id,
			data.name,
			slug,
			data.description || null,
			data.cover_image || null,
			data.start_date || null,
			data.end_date || null,
			data.total_budget || null,
			data.budget_currency || 'USD'
		).run();
		return id;
	}

	async updateTrip(id: string, data: { 
		name?: string; 
		description?: string | null; 
		cover_image?: string | null; 
		start_date?: string | null; 
		end_date?: string | null;
		total_budget?: number | null;
		budget_currency?: string;
	}) {
		const updates: string[] = [];
		const values: (string | number | null)[] = [];

		if (data.name !== undefined) {
			updates.push('name = ?', 'slug = ?');
			values.push(data.name, data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
		}
		if (data.description !== undefined) {
			updates.push('description = ?');
			values.push(data.description);
		}
		if (data.cover_image !== undefined) {
			updates.push('cover_image = ?');
			values.push(data.cover_image);
		}
		if (data.start_date !== undefined) {
			updates.push('start_date = ?');
			values.push(data.start_date);
		}
		if (data.end_date !== undefined) {
			updates.push('end_date = ?');
			values.push(data.end_date);
		}
		if (data.total_budget !== undefined) {
			updates.push('total_budget = ?');
			values.push(data.total_budget);
		}
		if (data.budget_currency !== undefined) {
			updates.push('budget_currency = ?');
			values.push(data.budget_currency);
		}

		values.push(id);
		await this.db.prepare(`UPDATE trips SET ${updates.join(', ')} WHERE id = ?`)
			.bind(...values)
			.run();
	}

	async deleteTrip(id: string) {
		await this.db.prepare('UPDATE posts SET trip_id = NULL WHERE trip_id = ?').bind(id).run();
		await this.db.prepare('DELETE FROM trips WHERE id = ?').bind(id).run();
	}

	async getTripById(id: string) {
		return await this.db.prepare('SELECT * FROM trips WHERE id = ?')
			.bind(id)
			.first<Trip>();
	}

	async getTripBySlug(slug: string) {
		return await this.db.prepare('SELECT * FROM trips WHERE slug = ?')
			.bind(slug)
			.first<Trip>();
	}

	async getAllTrips() {
		const result = await this.db.prepare('SELECT * FROM trips ORDER BY start_date DESC, created_at DESC').all<Trip>();
		return result.results;
	}

	// ============ COMMENT FUNCTIONS ============
	async createComment(data: { post_id: string; author_name: string; author_email?: string; content: string }) {
		const id = uuidv4();
		await this.db.prepare(`
			INSERT INTO comments (id, post_id, author_name, author_email, content)
			VALUES (?, ?, ?, ?, ?)
		`).bind(id, data.post_id, data.author_name, data.author_email || null, data.content).run();
		return id;
	}

	async approveComment(id: string) {
		await this.db.prepare('UPDATE comments SET approved = 1 WHERE id = ?').bind(id).run();
	}

	async deleteComment(id: string) {
		await this.db.prepare('DELETE FROM comments WHERE id = ?').bind(id).run();
	}

	async getCommentsForPost(postId: string, includeUnapproved = false) {
		const query = includeUnapproved
			? 'SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC'
			: 'SELECT * FROM comments WHERE post_id = ? AND approved = 1 ORDER BY created_at ASC';
		const result = await this.db.prepare(query).bind(postId).all<Comment>();
		return result.results;
	}

	async getAllComments(onlyUnapproved = false) {
		const query = onlyUnapproved
			? 'SELECT c.*, p.title as post_title FROM comments c JOIN posts p ON c.post_id = p.id WHERE c.approved = 0 ORDER BY c.created_at DESC'
			: 'SELECT c.*, p.title as post_title FROM comments c JOIN posts p ON c.post_id = p.id ORDER BY c.created_at DESC';
		const result = await this.db.prepare(query).all<Comment & { post_title: string }>();
		return result.results;
	}

	async getCommentCount(postId: string) {
		const result = await this.db.prepare('SELECT COUNT(*) as count FROM comments WHERE post_id = ? AND approved = 1')
			.bind(postId)
			.first<{ count: number }>();
		return result?.count || 0;
	}

	// ============ LIKE FUNCTIONS ============
	async addLike(postId: string, visitorId: string) {
		const id = uuidv4();
		try {
			await this.db.prepare('INSERT INTO likes (id, post_id, visitor_id) VALUES (?, ?, ?)')
				.bind(id, postId, visitorId)
				.run();
			return true;
		} catch {
			return false; // Already liked
		}
	}

	async removeLike(postId: string, visitorId: string) {
		await this.db.prepare('DELETE FROM likes WHERE post_id = ? AND visitor_id = ?')
			.bind(postId, visitorId)
			.run();
	}

	async hasLiked(postId: string, visitorId: string) {
		const result = await this.db.prepare('SELECT id FROM likes WHERE post_id = ? AND visitor_id = ?')
			.bind(postId, visitorId)
			.first();
		return !!result;
	}

	async getLikeCount(postId: string) {
		const result = await this.db.prepare('SELECT COUNT(*) as count FROM likes WHERE post_id = ?')
			.bind(postId)
			.first<{ count: number }>();
		return result?.count || 0;
	}

	// ============ ANALYTICS FUNCTIONS ============
	async recordPageView(data: { page_path: string; post_id?: string; visitor_id?: string; referrer?: string; user_agent?: string; country?: string }) {
		const id = uuidv4();
		await this.db.prepare(`
			INSERT INTO page_views (id, page_path, post_id, visitor_id, referrer, user_agent, country)
			VALUES (?, ?, ?, ?, ?, ?, ?)
		`).bind(
			id,
			data.page_path,
			data.post_id || null,
			data.visitor_id || null,
			data.referrer || null,
			data.user_agent || null,
			data.country || null
		).run();
	}

	async getAnalyticsSummary(days = 30) {
		const dateLimit = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
		
		const totalViews = await this.db.prepare(`
			SELECT COUNT(*) as count FROM page_views WHERE created_at >= ?
		`).bind(dateLimit).first<{ count: number }>();

		const uniqueVisitors = await this.db.prepare(`
			SELECT COUNT(DISTINCT visitor_id) as count FROM page_views WHERE created_at >= ? AND visitor_id IS NOT NULL
		`).bind(dateLimit).first<{ count: number }>();

		const topPosts = await this.db.prepare(`
			SELECT p.id, p.title, p.slug, COUNT(pv.id) as views
			FROM posts p
			JOIN page_views pv ON p.id = pv.post_id
			WHERE pv.created_at >= ?
			GROUP BY p.id
			ORDER BY views DESC
			LIMIT 10
		`).bind(dateLimit).all<{ id: string; title: string; slug: string; views: number }>();

		const topReferrers = await this.db.prepare(`
			SELECT referrer, COUNT(*) as count 
			FROM page_views 
			WHERE created_at >= ? AND referrer IS NOT NULL AND referrer != ''
			GROUP BY referrer
			ORDER BY count DESC
			LIMIT 10
		`).bind(dateLimit).all<{ referrer: string; count: number }>();

		const viewsByDay = await this.db.prepare(`
			SELECT DATE(created_at) as date, COUNT(*) as count
			FROM page_views
			WHERE created_at >= ?
			GROUP BY DATE(created_at)
			ORDER BY date ASC
		`).bind(dateLimit).all<{ date: string; count: number }>();

		return {
			totalViews: totalViews?.count || 0,
			uniqueVisitors: uniqueVisitors?.count || 0,
			topPosts: topPosts.results,
			topReferrers: topReferrers.results,
			viewsByDay: viewsByDay.results
		};
	}

	// ============ POST IMAGES (GALLERY) FUNCTIONS ============
	async addImageToPost(postId: string, photoId: string, sortOrder?: number) {
		const id = uuidv4();
		const order = sortOrder ?? 0;
		await this.db.prepare('INSERT INTO post_images (id, post_id, photo_id, sort_order) VALUES (?, ?, ?, ?)')
			.bind(id, postId, photoId, order)
			.run();
		return id;
	}

	async removeImageFromPost(postId: string, photoId: string) {
		await this.db.prepare('DELETE FROM post_images WHERE post_id = ? AND photo_id = ?')
			.bind(postId, photoId)
			.run();
	}

	async getImagesForPost(postId: string) {
		const result = await this.db.prepare(`
			SELECT ph.* FROM photos ph
			JOIN post_images pi ON ph.id = pi.photo_id
			WHERE pi.post_id = ?
			ORDER BY pi.sort_order ASC
		`).bind(postId).all<Photo>();
		return result.results;
	}

	async updateImageOrder(postId: string, photoId: string, sortOrder: number) {
		await this.db.prepare('UPDATE post_images SET sort_order = ? WHERE post_id = ? AND photo_id = ?')
			.bind(sortOrder, postId, photoId)
			.run();
	}

	// ============ PHOTO FUNCTIONS ============
	async addPhoto(data: { filename: string; original_name: string; caption?: string; location?: string; post_id?: string }) {
		const id = uuidv4();
		await this.db.prepare(`
			INSERT INTO photos (id, filename, original_name, caption, location, post_id)
			VALUES (?, ?, ?, ?, ?, ?)
		`).bind(
			id, 
			data.filename, 
			data.original_name, 
			data.caption || null, 
			data.location || null, 
			data.post_id || null
		).run();
		return id;
	}

	async updatePhoto(id: string, data: { caption?: string; location?: string; post_id?: string | null }) {
		const updates: string[] = [];
		const values: (string | null)[] = [];

		if (data.caption !== undefined) {
			updates.push('caption = ?');
			values.push(data.caption);
		}
		if (data.location !== undefined) {
			updates.push('location = ?');
			values.push(data.location);
		}
		if (data.post_id !== undefined) {
			updates.push('post_id = ?');
			values.push(data.post_id);
		}

		values.push(id);
		await this.db.prepare(`UPDATE photos SET ${updates.join(', ')} WHERE id = ?`)
			.bind(...values)
			.run();
	}

	async deletePhoto(id: string) {
		await this.db.prepare('DELETE FROM photos WHERE id = ?').bind(id).run();
	}

	async getPhotoById(id: string) {
		return await this.db.prepare('SELECT * FROM photos WHERE id = ?')
			.bind(id)
			.first<Photo>();
	}

	async getPhotoByFilename(filename: string) {
		return await this.db.prepare('SELECT * FROM photos WHERE filename = ?')
			.bind(filename)
			.first<Photo>();
	}

	async getAllPhotos() {
		const result = await this.db.prepare('SELECT * FROM photos ORDER BY created_at DESC').all<Photo>();
		return result.results;
	}

	async getPhotosByPostId(postId: string) {
		const result = await this.db.prepare('SELECT * FROM photos WHERE post_id = ? ORDER BY created_at DESC')
			.bind(postId)
			.all<Photo>();
		return result.results;
	}

	// ============ ADMIN SETUP ============
	async ensureAdminExists() {
		const admin = await this.getUserByUsername('admin');
		if (!admin) {
			await this.createUser('admin', 'admin123');
			console.log('Created default admin user (username: admin, password: admin123)');
		}
	}

	// ============ CATEGORY FUNCTIONS ============
	async getAllCategories() {
		const result = await this.db.prepare('SELECT * FROM categories ORDER BY sort_order ASC, name ASC').all<Category>();
		return result.results;
	}

	async getCategoryById(id: string) {
		return await this.db.prepare('SELECT * FROM categories WHERE id = ?')
			.bind(id)
			.first<Category>();
	}

	async getCategoryBySlug(slug: string) {
		return await this.db.prepare('SELECT * FROM categories WHERE slug = ?')
			.bind(slug)
			.first<Category>();
	}

	async getPostsByCategory(categorySlug: string) {
		const result = await this.db.prepare(`
			SELECT p.* FROM posts p
			JOIN categories c ON p.category_id = c.id
			WHERE c.slug = ? AND p.status = 'published'
			ORDER BY p.created_at DESC
		`).bind(categorySlug).all<Post>();
		return result.results;
	}

	async createCategory(data: { name: string; description?: string; icon?: string; sort_order?: number }) {
		const id = uuidv4();
		const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
		await this.db.prepare(`
			INSERT INTO categories (id, name, slug, description, icon, sort_order)
			VALUES (?, ?, ?, ?, ?, ?)
		`).bind(id, data.name, slug, data.description || null, data.icon || '📁', data.sort_order || 0).run();
		return id;
	}

	async updateCategory(id: string, data: { name?: string; description?: string; icon?: string; sort_order?: number }) {
		const updates: string[] = [];
		const values: (string | number | null)[] = [];

		if (data.name !== undefined) {
			updates.push('name = ?');
			values.push(data.name);
			updates.push('slug = ?');
			values.push(data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
		}
		if (data.description !== undefined) {
			updates.push('description = ?');
			values.push(data.description);
		}
		if (data.icon !== undefined) {
			updates.push('icon = ?');
			values.push(data.icon);
		}
		if (data.sort_order !== undefined) {
			updates.push('sort_order = ?');
			values.push(data.sort_order);
		}

		values.push(id);
		await this.db.prepare(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`)
			.bind(...values)
			.run();
	}

	async deleteCategory(id: string) {
		// First remove category from posts
		await this.db.prepare('UPDATE posts SET category_id = NULL WHERE category_id = ?').bind(id).run();
		await this.db.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
	}

	// ============ REACTION FUNCTIONS ============
	async getReactionsForPost(postId: string) {
		const result = await this.db.prepare(`
			SELECT emoji, COUNT(*) as count FROM reactions
			WHERE post_id = ?
			GROUP BY emoji
		`).bind(postId).all<{ emoji: string; count: number }>();
		return result.results;
	}

	async getVisitorReactions(postId: string, visitorId: string) {
		const result = await this.db.prepare(`
			SELECT emoji FROM reactions
			WHERE post_id = ? AND visitor_id = ?
		`).bind(postId, visitorId).all<{ emoji: string }>();
		return result.results.map(r => r.emoji);
	}

	async toggleReaction(postId: string, visitorId: string, emoji: string) {
		// Check if reaction exists
		const existing = await this.db.prepare(`
			SELECT id FROM reactions WHERE post_id = ? AND visitor_id = ? AND emoji = ?
		`).bind(postId, visitorId, emoji).first<{ id: string }>();

		if (existing) {
			await this.db.prepare('DELETE FROM reactions WHERE id = ?').bind(existing.id).run();
			return false;
		} else {
			const id = uuidv4();
			await this.db.prepare(`
				INSERT INTO reactions (id, post_id, visitor_id, emoji) VALUES (?, ?, ?, ?)
			`).bind(id, postId, visitorId, emoji).run();
			return true;
		}
	}

	// ============ RELATED POSTS ============
	async getRelatedPosts(postId: string, limit: number = 4) {
		// Get related posts by matching tags
		const result = await this.db.prepare(`
			SELECT DISTINCT p.* FROM posts p
			JOIN post_tags pt ON p.id = pt.post_id
			WHERE pt.tag_id IN (SELECT tag_id FROM post_tags WHERE post_id = ?)
			AND p.id != ?
			AND p.status = 'published'
			ORDER BY p.created_at DESC
			LIMIT ?
		`).bind(postId, postId, limit).all<Post>();
		return result.results;
	}

	// ============ SETTINGS FUNCTIONS ============
	async getSetting(key: string): Promise<string | null> {
		const result = await this.db.prepare('SELECT value FROM settings WHERE key = ?')
			.bind(key)
			.first<{ value: string }>();
		return result?.value || null;
	}

	async setSetting(key: string, value: string): Promise<void> {
		await this.db.prepare(`
			INSERT INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
			ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP
		`).bind(key, value, value).run();
	}

	async getAllSettings(): Promise<SiteSettings> {
		const result = await this.db.prepare('SELECT key, value FROM settings').all<Setting>();
		const settings: Record<string, string> = {};
		for (const row of result.results) {
			settings[row.key] = row.value;
		}
		return {
			site_name: settings.site_name || 'Travel Food Blog',
			site_description: settings.site_description || '',
			site_logo: settings.site_logo || '',
			footer_text: settings.footer_text || '© {year} Travel Blog. All adventures reserved.',
			primary_color: settings.primary_color || '#e11d48',
			default_theme: (settings.default_theme as 'light' | 'dark' | 'system') || 'system',
			comments_enabled: settings.comments_enabled !== 'false',
			reactions_enabled: settings.reactions_enabled !== 'false',
			notification_email: settings.notification_email || ''
		};
	}

	async updateSettings(settings: Partial<SiteSettings>): Promise<void> {
		const entries = Object.entries(settings);
		for (const [key, value] of entries) {
			const stringValue = typeof value === 'boolean' ? String(value) : (value || '');
			await this.setSetting(key, stringValue);
		}
	}
}

// Helper to get database from platform
export function getDatabase(platform: App.Platform | undefined): Database {
	if (!platform?.env?.DB) {
		throw new Error('Database not available. Make sure D1 is configured.');
	}
	return new Database(platform.env.DB);
}

// Helper to get R2 bucket from platform
export function getPhotoBucket(platform: App.Platform | undefined): R2Bucket {
	if (!platform?.env?.PHOTOS) {
		throw new Error('R2 bucket not available. Make sure R2 is configured.');
	}
	return platform.env.PHOTOS;
}
