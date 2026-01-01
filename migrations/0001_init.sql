-- Users table
CREATE TABLE IF NOT EXISTS users (
	id TEXT PRIMARY KEY,
	username TEXT UNIQUE NOT NULL,
	password_hash TEXT NOT NULL,
	created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
	id TEXT PRIMARY KEY,
	user_id TEXT NOT NULL,
	expires_at TEXT NOT NULL,
	FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
	id TEXT PRIMARY KEY,
	title TEXT NOT NULL,
	slug TEXT UNIQUE NOT NULL,
	content TEXT NOT NULL,
	excerpt TEXT,
	location TEXT,
	cover_image TEXT,
	published INTEGER DEFAULT 0,
	created_at TEXT DEFAULT CURRENT_TIMESTAMP,
	updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Photos table
CREATE TABLE IF NOT EXISTS photos (
	id TEXT PRIMARY KEY,
	filename TEXT NOT NULL,
	original_name TEXT NOT NULL,
	caption TEXT,
	location TEXT,
	post_id TEXT,
	created_at TEXT DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (post_id) REFERENCES posts(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
CREATE INDEX IF NOT EXISTS idx_photos_post_id ON photos(post_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
