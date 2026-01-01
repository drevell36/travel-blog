import type { RequestHandler } from './$types';
import { getDatabase } from '$lib/server/db';

export const GET: RequestHandler = async ({ platform, url }) => {
	const db = getDatabase(platform);
	const posts = await db.getAllPosts();
	const siteUrl = url.origin;

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Travel Blog</title>
    <description>Adventures and stories from around the world</description>
    <link>${siteUrl}</link>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${posts.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.excerpt || post.content.substring(0, 200)}]]></description>
      <link>${siteUrl}/post/${post.slug}</link>
      <guid isPermaLink="true">${siteUrl}/post/${post.slug}</guid>
      <pubDate>${new Date(post.created_at).toUTCString()}</pubDate>
      ${post.location ? `<category>${post.location}</category>` : ''}
    </item>`).join('')}
  </channel>
</rss>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/rss+xml',
			'Cache-Control': 'max-age=3600'
		}
	});
};
