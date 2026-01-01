-- Migration: Remove unused tables and columns
-- Dropping: subscribers, post_translations tables
-- These features were never implemented in the UI

-- Drop subscribers table (newsletter feature never built)
DROP TABLE IF EXISTS subscribers;

-- Drop post_translations table (i18n feature never built)
DROP TABLE IF EXISTS post_translations;

-- Note: Keeping locale column in posts table as it doesn't hurt and might be useful later
-- Note: Keeping budget fields as they ARE used in trips feature
