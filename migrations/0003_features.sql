-- Migration: Add all blog features
-- Tags, Trips, Comments, Likes, Subscribers, Analytics, etc.

-- Add new columns to posts table
ALTER TABLE posts ADD COLUMN status TEXT DEFAULT 'draft';
ALTER TABLE posts ADD COLUMN scheduled_for TEXT;
ALTER TABLE posts ADD COLUMN trip_id TEXT;
ALTER TABLE posts ADD COLUMN latitude REAL;
ALTER TABLE posts ADD COLUMN longitude REAL;
ALTER TABLE posts ADD COLUMN video_url TEXT;
ALTER TABLE posts ADD COLUMN budget_amount REAL;
ALTER TABLE posts ADD COLUMN budget_currency TEXT DEFAULT 'USD';
ALTER TABLE posts ADD COLUMN locale TEXT DEFAULT 'en';
ALTER TABLE posts ADD COLUMN view_count INTEGER DEFAULT 0;

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
	id TEXT PRIMARY KEY,
	name TEXT UNIQUE NOT NULL,
	slug TEXT UNIQUE NOT NULL,
	color TEXT DEFAULT '#3b82f6',
	created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Post-Tags junction table
CREATE TABLE IF NOT EXISTS post_tags (
	post_id TEXT NOT NULL,
	tag_id TEXT NOT NULL,
	PRIMARY KEY (post_id, tag_id),
	FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
	FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Trips table
CREATE TABLE IF NOT EXISTS trips (
	id TEXT PRIMARY KEY,
	name TEXT NOT NULL,
	slug TEXT UNIQUE NOT NULL,
	description TEXT,
	cover_image TEXT,
	start_date TEXT,
	end_date TEXT,
	total_budget REAL,
	budget_currency TEXT DEFAULT 'USD',
	created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
	id TEXT PRIMARY KEY,
	post_id TEXT NOT NULL,
	author_name TEXT NOT NULL,
	author_email TEXT,
	content TEXT NOT NULL,
	approved INTEGER DEFAULT 0,
	created_at TEXT DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Likes table
CREATE TABLE IF NOT EXISTS likes (
	id TEXT PRIMARY KEY,
	post_id TEXT NOT NULL,
	visitor_id TEXT NOT NULL,
	created_at TEXT DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
	UNIQUE(post_id, visitor_id)
);

-- Subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
	id TEXT PRIMARY KEY,
	email TEXT UNIQUE NOT NULL,
	name TEXT,
	confirmed INTEGER DEFAULT 0,
	confirm_token TEXT,
	unsubscribe_token TEXT,
	created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Analytics/Page views table
CREATE TABLE IF NOT EXISTS page_views (
	id TEXT PRIMARY KEY,
	page_path TEXT NOT NULL,
	post_id TEXT,
	visitor_id TEXT,
	referrer TEXT,
	user_agent TEXT,
	country TEXT,
	created_at TEXT DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL
);

-- Post gallery images (multiple photos per post)
CREATE TABLE IF NOT EXISTS post_images (
	id TEXT PRIMARY KEY,
	post_id TEXT NOT NULL,
	photo_id TEXT NOT NULL,
	sort_order INTEGER DEFAULT 0,
	FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
	FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE CASCADE
);

-- Translations table for multi-language support
CREATE TABLE IF NOT EXISTS post_translations (
	id TEXT PRIMARY KEY,
	post_id TEXT NOT NULL,
	locale TEXT NOT NULL,
	title TEXT NOT NULL,
	content TEXT NOT NULL,
	excerpt TEXT,
	created_at TEXT DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
	UNIQUE(post_id, locale)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_trips_slug ON trips(slug);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_approved ON comments(approved);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_visitor ON likes(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_views_post ON page_views(post_id);
CREATE INDEX IF NOT EXISTS idx_page_views_date ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_post_images_post ON post_images(post_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled ON posts(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_posts_trip ON posts(trip_id);
CREATE INDEX IF NOT EXISTS idx_post_translations_locale ON post_translations(locale);

-- Update existing published column to use new status system
UPDATE posts SET status = 'published' WHERE published = 1;
UPDATE posts SET status = 'draft' WHERE published = 0;
