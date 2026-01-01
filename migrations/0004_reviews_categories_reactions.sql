-- Migration: Add reviews, categories, and reactions
-- Features: Restaurant/Place Reviews, Categories, Reactions

-- Categories table (broader groupings than tags)
CREATE TABLE IF NOT EXISTS categories (
	id TEXT PRIMARY KEY,
	name TEXT UNIQUE NOT NULL,
	slug TEXT UNIQUE NOT NULL,
	description TEXT,
	icon TEXT DEFAULT '📁',
	sort_order INTEGER DEFAULT 0,
	created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Add category_id to posts
ALTER TABLE posts ADD COLUMN category_id TEXT REFERENCES categories(id);

-- Review/Place fields on posts
ALTER TABLE posts ADD COLUMN place_name TEXT;
ALTER TABLE posts ADD COLUMN place_address TEXT;
ALTER TABLE posts ADD COLUMN place_phone TEXT;
ALTER TABLE posts ADD COLUMN place_website TEXT;
ALTER TABLE posts ADD COLUMN place_hours TEXT;
ALTER TABLE posts ADD COLUMN rating INTEGER;
ALTER TABLE posts ADD COLUMN price_range INTEGER;

-- Reactions table (emoji reactions on posts)
CREATE TABLE IF NOT EXISTS reactions (
	id TEXT PRIMARY KEY,
	post_id TEXT NOT NULL,
	visitor_id TEXT NOT NULL,
	emoji TEXT NOT NULL,
	created_at TEXT DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
	UNIQUE(post_id, visitor_id, emoji)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_reactions_post ON reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_reactions_visitor ON reactions(visitor_id);

-- Insert default categories
INSERT INTO categories (id, name, slug, description, icon, sort_order) VALUES 
	('cat_streetfood', 'Street Food', 'street-food', 'Delicious street eats from around the world', '🍜', 1),
	('cat_finedining', 'Fine Dining', 'fine-dining', 'Upscale restaurant experiences', '🍽️', 2),
	('cat_cafes', 'Cafes & Coffee', 'cafes', 'Coffee shops and cozy cafes', '☕', 3),
	('cat_local', 'Local Favorites', 'local-favorites', 'Hidden gems loved by locals', '⭐', 4),
	('cat_markets', 'Markets & Food Halls', 'markets', 'Food markets and bazaars', '🏪', 5),
	('cat_travel', 'Travel Stories', 'travel-stories', 'Adventures and travel tales', '✈️', 6);
