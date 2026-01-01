-- Migration: Site Settings
-- Stores configurable site settings

CREATE TABLE IF NOT EXISTS settings (
	key TEXT PRIMARY KEY,
	value TEXT NOT NULL,
	updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT OR IGNORE INTO settings (key, value) VALUES 
	('site_name', 'Travel Food Blog'),
	('site_description', 'Adventures in food and travel from around the world'),
	('site_logo', ''),
	('footer_text', '© {year} Travel Blog. All adventures reserved.'),
	('primary_color', '#e11d48'),
	('default_theme', 'system'),
	('comments_enabled', 'true'),
	('reactions_enabled', 'true'),
	('notification_email', '');
