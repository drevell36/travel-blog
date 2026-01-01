import type { RequestHandler } from './$types';
import { getDatabase } from '$lib/server/db';

export const GET: RequestHandler = async ({ platform, url }) => {
	const db = getDatabase(platform);
	const posts = await db.getAllPosts();
	const tags = await db.getAllTags();
	const trips = await db.getAllTrips();
	const siteUrl = url.origin;

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/photos</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${siteUrl}/search</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  ${posts.map(post => `
  <url>
    <loc>${siteUrl}/post/${post.slug}</loc>
    <lastmod>${new Date(post.updated_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>`).join('')}
  ${tags.map(tag => `
  <url>
    <loc>${siteUrl}/tag/${tag.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
  ${trips.map(trip => `
  <url>
    <loc>${siteUrl}/trip/${trip.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=3600'
		}
	});
};
