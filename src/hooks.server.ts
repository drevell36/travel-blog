import type { Handle } from '@sveltejs/kit';
import { getDatabase } from '$lib/server/db';
import { getSupabaseServer } from '$lib/server/supabase';

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(key: string, limit: number, windowMs: number): boolean {
	const now = Date.now();
	const record = rateLimitMap.get(key);
	
	// Clean up old entries lazily (Cloudflare Workers don't support setInterval in global scope)
	for (const [k, v] of rateLimitMap.entries()) {
		if (now > v.resetTime) {
			rateLimitMap.delete(k);
		}
	}
	
	if (!record || now > record.resetTime) {
		rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
		return false;
	}
	
	record.count++;
	return record.count > limit;
}

export const handle: Handle = async ({ event, resolve }) => {
	const clientIP = event.request.headers.get('cf-connecting-ip') || 
		event.request.headers.get('x-forwarded-for')?.split(',')[0] || 
		'unknown';
	
	// Rate limit login attempts: 5 per minute
	if (event.url.pathname === '/login' && event.request.method === 'POST') {
		if (isRateLimited(`login:${clientIP}`, 5, 60000)) {
			return new Response('Too many login attempts. Please try again later.', { status: 429 });
		}
	}
	
	// Rate limit comment submissions: 10 per minute
	if (event.url.pathname.startsWith('/post/') && event.request.method === 'POST') {
		if (isRateLimited(`comment:${clientIP}`, 10, 60000)) {
			return new Response('Too many requests. Please slow down.', { status: 429 });
		}
	}

	// Rate limit API requests: 30 per minute
	if (event.url.pathname.startsWith('/api/')) {
		if (isRateLimited(`api:${clientIP}`, 30, 60000)) {
			return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { 
				status: 429,
				headers: { 'Content-Type': 'application/json' }
			});
		}
	}

	// Authenticate with Supabase
	try {
		const supabase = getSupabaseServer(event);
		const { data: { user }, error } = await supabase.auth.getUser();

		if (user && !error) {
			event.locals.user = {
				id: user.id,
				username: user.user_metadata?.username || user.email || 'user',
				email: user.email
			};
		}
	} catch (e) {
		console.error('Auth check failed:', e);
	}

	const response = await resolve(event);
	
	// Add security headers
	response.headers.set('X-Frame-Options', 'SAMEORIGIN');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
	
	// Content Security Policy - only apply in production
	// In dev mode, CSP can break web workers like Tesseract.js
	if (event.url.hostname !== 'localhost') {
		const csp = [
			"default-src 'self'",
			"script-src 'self' 'unsafe-inline' blob: https://unpkg.com https://cdn.jsdelivr.net",
			"style-src 'self' 'unsafe-inline' https://unpkg.com",
			"img-src 'self' data: blob: https: http:",
			"font-src 'self' data:",
			"connect-src 'self' https://tessdata.projectnaptha.com https://cdn.jsdelivr.net",
			"worker-src 'self' blob:",
			"frame-src 'self' https://www.youtube.com https://player.vimeo.com",
			"frame-ancestors 'self'"
		].join('; ');
		response.headers.set('Content-Security-Policy', csp);
	}

	return response;
};
