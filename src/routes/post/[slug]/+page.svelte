<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import LeafletMap from '$lib/components/LeafletMap.svelte';
	import { sanitizeHtml } from '$lib/utils/sanitize';
	
	let { data, form } = $props();
	
	const shareUrl = $derived(`${page.url.origin}/post/${data.post.slug}`);
	const shareTitle = $derived(data.post.title);
	
	const reactionEmojis = ['🔥', '❤️', '😋', '👏', '🤩'];
	
	function getReactionCount(emoji: string): number {
		const reaction = data.reactions.find(r => r.emoji === emoji);
		return reaction?.count || 0;
	}
	
	function hasReacted(emoji: string): boolean {
		return data.visitorReactions.includes(emoji);
	}
	
	function renderStars(rating: number): string {
		return '⭐'.repeat(rating);
	}
	
	function renderPrice(price: number): string {
		return '$'.repeat(price);
	}
</script>

<svelte:head>
	<title>{data.post.title} - Travel Blog</title>
	<meta name="description" content={data.post.excerpt || data.post.title} />
	<meta property="og:title" content={data.post.title} />
	<meta property="og:description" content={data.post.excerpt || ''} />
	{#if data.post.cover_image}
		<meta property="og:image" content={data.post.cover_image} />
	{/if}
</svelte:head>

<!-- Breadcrumbs -->
<nav class="breadcrumbs">
	<a href="/">Home</a>
	<span>›</span>
	<a href="/posts">Posts</a>
	{#if data.category}
		<span>›</span>
		<a href="/category/{data.category.slug}">{data.category.icon} {data.category.name}</a>
	{/if}
	<span>›</span>
	<span class="current">{data.post.title}</span>
</nav>

<article class="post-detail">
	{#if data.post.cover_image}
		<img src={data.post.cover_image} alt={data.post.title} class="post-cover" />
	{/if}

	<div class="post-header">
		{#if data.trip}
			<a href="/trip/{data.trip.slug}" class="trip-link">🧳 {data.trip.name}</a>
		{/if}
		{#if data.category}
			<span class="category-badge">{data.category.icon} {data.category.name}</span>
		{/if}
		<h1>{data.post.title}</h1>
		<div class="post-meta">
			{#if data.post.location}
				<span>📍 {data.post.location}</span>
			{/if}
			<span>📅 {new Date(data.post.created_at).toLocaleDateString('en-US', { 
				year: 'numeric', 
				month: 'long', 
				day: 'numeric' 
			})}</span>
			{#if data.post.rating}
				<span class="rating">{renderStars(data.post.rating)}</span>
			{/if}
			{#if data.post.price_range}
				<span class="price-range">{renderPrice(data.post.price_range)}</span>
			{/if}
		</div>

		{#if data.tags.length > 0}
			<div class="tags">
				{#each data.tags as tag}
					<a href="/tag/{tag.slug}" class="tag" style="background-color: {tag.color}">{tag.name}</a>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Place Info Card -->
	{#if data.post.place_name}
		<div class="place-card">
			<h3>🍽️ {data.post.place_name}</h3>
			<div class="place-details">
				{#if data.post.place_address}
					<p>📍 {data.post.place_address}</p>
				{/if}
				{#if data.post.place_phone}
					<p>📞 <a href="tel:{data.post.place_phone}">{data.post.place_phone}</a></p>
				{/if}
				{#if data.post.place_website}
					<p>🌐 <a href={data.post.place_website} target="_blank" rel="noopener">Website</a></p>
				{/if}
				{#if data.post.place_hours}
					<p>🕐 {data.post.place_hours}</p>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Video embed -->
	{#if data.post.video_url}
		<div class="video-embed">
			<iframe src={data.post.video_url} title="Video" frameborder="0" allowfullscreen></iframe>
		</div>
	{/if}

	<div class="post-content">
		{@html sanitizeHtml(data.post.content).replace(/\n/g, '<br>')}
	</div>

	<!-- Gallery Images -->
	{#if data.galleryImages.length > 0}
		<section class="gallery-section">
			<h2>📷 Photo Gallery</h2>
			<div class="gallery-grid">
				{#each data.galleryImages as photo}
					<img src="/photos/{photo.filename}" alt={photo.caption || 'Photo'} />
				{/each}
			</div>
		</section>
	{/if}

	<!-- Map (if coordinates exist) -->
	{#if data.post.latitude && data.post.longitude}
		<section class="map-section">
			<h2>📍 Location</h2>
			<LeafletMap 
				latitude={data.post.latitude} 
				longitude={data.post.longitude} 
				markerTitle={data.post.place_name || data.post.location || data.post.title}
				height="350px"
			/>
			<a href="https://www.openstreetmap.org/?mlat={data.post.latitude}&mlon={data.post.longitude}#map=15/{data.post.latitude}/{data.post.longitude}" target="_blank" class="btn btn-sm btn-outline map-link">
				Open in Maps ↗
			</a>
		</section>
	{/if}

	<!-- Legacy photos -->
	{#if data.photos.length > 0}
		<section class="photos-section">
			<h2>Photos from this trip</h2>
			<div class="photo-grid">
				{#each data.photos as photo}
					<div class="photo-item">
						<img src="/photos/{photo.filename}" alt={photo.caption || 'Travel photo'} />
						{#if photo.caption}
							<div class="photo-overlay">
								<p>{photo.caption}</p>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Like & Share -->
	<div class="engagement-bar">
		<form method="POST" action="?/like" use:enhance class="like-form">
			<button type="submit" class="like-btn" class:liked={data.hasLiked}>
				{data.hasLiked ? '❤️' : '🤍'} {data.likeCount}
			</button>
		</form>

		<div class="share-buttons">
			<span>Share:</span>
			<a href="https://twitter.com/intent/tweet?url={encodeURIComponent(shareUrl)}&text={encodeURIComponent(shareTitle)}" target="_blank" class="share-btn twitter">𝕏</a>
			<a href="https://www.facebook.com/sharer/sharer.php?u={encodeURIComponent(shareUrl)}" target="_blank" class="share-btn facebook">f</a>
			<a href="https://www.linkedin.com/sharing/share-offsite/?url={encodeURIComponent(shareUrl)}" target="_blank" class="share-btn linkedin">in</a>
			<a href="mailto:?subject={encodeURIComponent(shareTitle)}&body={encodeURIComponent(shareUrl)}" class="share-btn email">✉</a>
		</div>
	</div>

	<!-- Reactions -->
	{#if (data as any).settings?.reactions_enabled !== false}
	<div class="reactions-bar">
		<span class="reactions-label">React:</span>
		<div class="reaction-buttons">
			{#each reactionEmojis as emoji}
				<form method="POST" action="?/react" use:enhance class="reaction-form">
					<input type="hidden" name="emoji" value={emoji} />
					<button type="submit" class="reaction-btn" class:active={hasReacted(emoji)}>
						{emoji}
						{#if getReactionCount(emoji) > 0}
							<span class="reaction-count">{getReactionCount(emoji)}</span>
						{/if}
					</button>
				</form>
			{/each}
		</div>
	</div>
	{/if}
</article>

<!-- Related Posts -->
{#if data.relatedPosts.length > 0}
	<section class="related-posts">
		<h2>You Might Also Like</h2>
		<div class="related-grid">
			{#each data.relatedPosts as relatedPost}
				<a href="/post/{relatedPost.slug}" class="related-card">
					{#if relatedPost.cover_image}
						<img src={relatedPost.cover_image} alt={relatedPost.title} />
					{:else}
						<div class="related-placeholder">🍽️</div>
					{/if}
					<div class="related-info">
						<h4>{relatedPost.title}</h4>
						{#if relatedPost.location}
							<span class="related-location">📍 {relatedPost.location}</span>
						{/if}
					</div>
				</a>
			{/each}
		</div>
	</section>
{/if}

<!-- Comments Section -->
{#if (data as any).settings?.comments_enabled !== false}
<section class="comments-section">
	<div class="comments-header">
		<h2>Comments</h2>
		<span class="comment-count">{data.comments.length}</span>
	</div>

	{#if form?.commentSuccess}
		<div class="alert alert-success">Thanks for your comment! It will appear after approval.</div>
	{/if}

	{#if form?.commentError}
		<div class="alert alert-error">{form.commentError}</div>
	{/if}

	<!-- Comment Form -->
	<form method="POST" action="?/comment" use:enhance class="comment-form">
		<div class="comment-form-header">
			<div class="avatar-placeholder">👤</div>
			<span class="form-title">Leave a comment</span>
		</div>
		<div class="form-fields">
			<div class="form-row">
				<div class="input-group">
					<label for="author_name">Name</label>
					<input type="text" id="author_name" name="author_name" placeholder="Your name" required />
				</div>
				<div class="input-group">
					<label for="author_email">Email <span class="optional">(optional)</span></label>
					<input type="email" id="author_email" name="author_email" placeholder="your@email.com" />
				</div>
			</div>
			<div class="input-group">
				<label for="comment_content">Comment</label>
				<textarea id="comment_content" name="content" placeholder="Share your thoughts..." required rows="3"></textarea>
			</div>
			<button type="submit" class="btn btn-primary submit-btn">
				<span>Post Comment</span>
				<span class="btn-icon">→</span>
			</button>
		</div>
	</form>

	<!-- Comments List -->
	<div class="comments-list">
		{#each data.comments as comment}
			<div class="comment">
				<div class="comment-avatar">
					{comment.author_name.charAt(0).toUpperCase()}
				</div>
				<div class="comment-body">
					<div class="comment-meta">
						<strong class="comment-author">{comment.author_name}</strong>
						<span class="comment-date">{new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
					</div>
					<p class="comment-text">{comment.content}</p>
				</div>
			</div>
		{:else}
			<div class="no-comments">
				<span class="no-comments-icon">💬</span>
				<p>No comments yet</p>
				<span class="no-comments-hint">Be the first to share your thoughts!</span>
			</div>
		{/each}
	</div>
</section>
{/if}

<div style="margin-top: 3rem; text-align: center;">
	<a href="/" class="btn btn-outline">← Back to all posts</a>
</div>

<style>
	/* Breadcrumbs */
	.breadcrumbs {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: var(--text-muted);
		margin-bottom: 1.5rem;
		flex-wrap: wrap;
	}

	.breadcrumbs a {
		color: var(--text-muted);
		text-decoration: none;
	}

	.breadcrumbs a:hover {
		color: var(--primary);
	}

	.breadcrumbs .current {
		color: var(--text);
		font-weight: 500;
		max-width: 200px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.category-badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		background: var(--surface);
		border-radius: 1rem;
		font-size: 0.8rem;
		color: var(--text-muted);
		margin-bottom: 0.5rem;
	}

	.rating, .price-range {
		font-size: 0.9rem;
	}

	/* Place Card */
	.place-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 1.25rem;
		margin: 1.5rem 0;
	}

	.place-card h3 {
		margin: 0 0 1rem;
		font-size: 1.1rem;
	}

	.place-details p {
		margin: 0.5rem 0;
		font-size: 0.9rem;
		color: var(--text-muted);
	}

	.place-details a {
		color: var(--primary);
	}

	/* Reactions */
	.reactions-bar {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.75rem;
		padding: 0.5rem 0.75rem;
		background: var(--surface);
		border-radius: var(--radius);
	}

	.reactions-label {
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.reaction-buttons {
		display: flex;
		gap: 0.25rem;
	}

	.reaction-form {
		display: inline;
	}

	.reaction-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.125rem;
		padding: 0.25rem 0.5rem;
		background: var(--background);
		border: 1px solid var(--border);
		border-radius: 1rem;
		cursor: pointer;
		font-size: 0.875rem;
		transition: all 0.2s;
	}

	.reaction-btn:hover {
		transform: scale(1.1);
		border-color: var(--primary);
	}

	.reaction-btn.active {
		background: var(--primary);
		border-color: var(--primary);
	}

	.reaction-count {
		font-size: 0.625rem;
		color: var(--text);
	}

	.reaction-btn.active .reaction-count {
		color: white;
	}

	/* Related Posts */
	.related-posts {
		margin-top: 3rem;
		padding-top: 2rem;
		border-top: 1px solid var(--border);
	}

	.related-posts h2 {
		margin-bottom: 1.5rem;
	}

	.related-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1.5rem;
	}

	.related-card {
		background: var(--card);
		border-radius: var(--radius);
		overflow: hidden;
		text-decoration: none;
		color: inherit;
		transition: transform 0.2s;
	}

	.related-card:hover {
		transform: translateY(-4px);
	}

	.related-card img {
		width: 100%;
		height: 120px;
		object-fit: cover;
	}

	.related-placeholder {
		width: 100%;
		height: 120px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--surface);
		font-size: 2rem;
	}

	.related-info {
		padding: 0.75rem;
	}

	.related-info h4 {
		margin: 0;
		font-size: 0.9rem;
		line-height: 1.3;
	}

	.related-location {
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.trip-link {
		display: inline-block;
		margin-bottom: 1rem;
		padding: 0.5rem 1rem;
		background: var(--card);
		border-radius: 1rem;
		text-decoration: none;
		color: var(--text);
		font-size: 0.875rem;
	}

	.trip-link:hover {
		background: var(--primary);
		color: white;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.tag {
		padding: 0.25rem 0.75rem;
		border-radius: 1rem;
		color: white;
		text-decoration: none;
		font-size: 0.875rem;
	}

	.tag:hover {
		opacity: 0.8;
	}

	.video-embed {
		margin: 2rem 0;
		position: relative;
		padding-bottom: 56.25%;
		height: 0;
		overflow: hidden;
		border-radius: var(--radius);
	}

	.video-embed iframe {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	.gallery-section, .map-section, .photos-section {
		margin-top: 3rem;
	}

	.gallery-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1rem;
		margin-top: 1rem;
	}

	.gallery-grid img {
		width: 100%;
		aspect-ratio: 4/3;
		object-fit: cover;
		border-radius: var(--radius);
		cursor: pointer;
		transition: transform 0.2s;
	}

	.gallery-grid img:hover {
		transform: scale(1.02);
	}

	.map-section {
		margin: 2rem 0;
	}

	.map-link {
		margin-top: 0.75rem;
		display: inline-block;
	}

	.engagement-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 3rem;
		padding: 1.5rem;
		background: var(--card);
		border-radius: var(--radius);
		flex-wrap: wrap;
		gap: 1rem;
	}

	.like-btn {
		background: none;
		border: 2px solid var(--border);
		padding: 0.75rem 1.5rem;
		border-radius: 2rem;
		font-size: 1.25rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.like-btn:hover, .like-btn.liked {
		border-color: var(--primary);
		background: rgba(59, 130, 246, 0.1);
	}

	.share-buttons {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.share-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		text-decoration: none;
		font-weight: bold;
		transition: transform 0.2s;
	}

	.share-btn:hover {
		transform: scale(1.1);
	}

	.share-btn.twitter {
		background: #1da1f2;
		color: white;
	}

	.share-btn.facebook {
		background: #4267b2;
		color: white;
	}

	.share-btn.linkedin {
		background: #0077b5;
		color: white;
	}

	.share-btn.email {
		background: var(--text-light);
		color: white;
	}

	.comments-section {
		margin-top: 2.5rem;
		padding-top: 2rem;
		border-top: 1px solid var(--border);
	}

	.comments-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.comments-header h2 {
		margin: 0;
		font-size: 1.125rem;
	}

	.comment-count {
		background: var(--primary);
		color: white;
		font-size: 0.7rem;
		font-weight: 600;
		padding: 0.15rem 0.5rem;
		border-radius: 1rem;
	}

	.comment-form {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 1rem;
		margin-bottom: 1.5rem;
	}

	.comment-form-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--border);
	}

	.avatar-placeholder {
		width: 28px;
		height: 28px;
		background: linear-gradient(135deg, var(--primary), #764ba2);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.875rem;
	}

	.form-title {
		font-weight: 600;
		font-size: 0.875rem;
		color: var(--text);
	}

	.form-fields {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.input-group label {
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--text);
	}

	.input-group .optional {
		color: var(--text-light);
		font-weight: 400;
	}

	.comment-form input,
	.comment-form textarea {
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--background);
		color: var(--text);
		font-size: 0.8125rem;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.comment-form input:focus,
	.comment-form textarea:focus {
		outline: none;
		border-color: var(--primary);
		box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
	}

	.comment-form textarea {
		resize: vertical;
		min-height: 70px;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.submit-btn {
		align-self: flex-start;
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-weight: 600;
		font-size: 0.8125rem;
		margin-top: 0.25rem;
	}

	.btn-icon {
		transition: transform 0.2s;
	}

	.submit-btn:hover .btn-icon {
		transform: translateX(3px);
	}

	.comments-list {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.comment {
		display: flex;
		gap: 0.75rem;
		padding: 0.75rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 8px;
		transition: border-color 0.2s;
	}

	.comment:hover {
		border-color: var(--primary);
	}

	.comment-avatar {
		width: 32px;
		height: 32px;
		background: linear-gradient(135deg, #667eea, #764ba2);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-weight: 700;
		font-size: 0.875rem;
		flex-shrink: 0;
	}

	.comment-body {
		flex: 1;
		min-width: 0;
	}

	.comment-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.25rem;
	}

	.comment-author {
		font-weight: 600;
		font-size: 0.8125rem;
		color: var(--text);
	}

	.comment-date {
		color: var(--text-light);
		font-size: 0.7rem;
	}

	.comment-text {
		margin: 0;
		color: var(--text);
		font-size: 0.8125rem;
		line-height: 1.5;
		white-space: pre-wrap;
	}

	.no-comments {
		text-align: center;
		padding: 1.5rem 1rem;
		background: var(--surface);
		border: 1px dashed var(--border);
		border-radius: 8px;
	}

	.no-comments-icon {
		font-size: 1.5rem;
		display: block;
		margin-bottom: 0.5rem;
	}

	.no-comments p {
		margin: 0;
		font-weight: 600;
		font-size: 0.875rem;
		color: var(--text);
	}

	.no-comments-hint {
		display: block;
		margin-top: 0.25rem;
		color: var(--text-light);
		font-size: 0.75rem;
	}

	@media (max-width: 600px) {
		.form-row {
			grid-template-columns: 1fr;
		}

		.comment {
			flex-direction: column;
			gap: 0.5rem;
		}

		.comment-avatar {
			width: 28px;
			height: 28px;
			font-size: 0.75rem;
		}
	}
</style>
