<script lang="ts">
	import { enhance } from '$app/forms';
	import MarkdownEditor from '$lib/components/MarkdownEditor.svelte';
	import OcrScanner from '$lib/components/OcrScanner.svelte';
	import { untrack } from 'svelte';
	
	let { data, form } = $props();
	let showGallery = $state(false);
	let content = $state('');
	
	// Initialize content from data
	$effect(() => {
		untrack(() => {
			if (!content && data.post.content) {
				content = data.post.content;
			}
		});
	});
	
	function handleOcrText(text: string) {
		// Append scanned text to content
		content = content ? content + '\n\n' + text : text;
	}
</script>

<svelte:head>
	<title>Edit Post - Admin</title>
</svelte:head>

<div class="page-header">
	<h1>Edit Post</h1>
	<div class="header-actions">
		<a href="/post/{data.post.slug}" class="btn btn-outline" target="_blank">View Post</a>
		<a href="/admin/posts" class="btn btn-outline">← Back</a>
	</div>
</div>

{#if form?.error}
	<div class="alert alert-error">{form.error}</div>
{/if}

{#if form?.success}
	<div class="alert alert-success">Post updated successfully!</div>
{/if}

<form method="POST" action="?/update" use:enhance>
	<div class="form-grid">
		<div class="main-column">
			<div class="form-group">
				<label for="title">Title *</label>
				<input type="text" id="title" name="title" required value={data.post.title} />
			</div>

			<div class="form-group">
				<label for="excerpt">Excerpt</label>
				<textarea id="excerpt" name="excerpt" rows="2" placeholder="Brief summary for cards and SEO">{data.post.excerpt || ''}</textarea>
			</div>

			<div class="form-group">
				<label for="content">Content * <span class="hint">(Markdown supported)</span></label>
				<OcrScanner onTextExtracted={handleOcrText} />
				<MarkdownEditor bind:value={content} id="content" name="content" />
			</div>

			<div class="form-group">
				<label for="video_url">Video URL</label>
				<input type="url" id="video_url" name="video_url" value={data.post.video_url || ''} placeholder="https://youtube.com/embed/..." />
			</div>
		</div>

		<div class="sidebar-column">
			<div class="card">
				<h3>📤 Publish</h3>
				<div class="form-group">
					<label for="status">Status</label>
					<select name="status" id="status">
						<option value="draft" selected={data.post.status === 'draft'}>Draft</option>
						<option value="published" selected={data.post.status === 'published'}>Published</option>
						<option value="scheduled" selected={data.post.status === 'scheduled'}>Scheduled</option>
					</select>
				</div>
				<div class="form-group">
					<label for="scheduled_for">Schedule Date</label>
					<input type="datetime-local" id="scheduled_for" name="scheduled_for" value={data.post.scheduled_for?.slice(0, 16) || ''} />
				</div>
			</div>

			<div class="card">
				<h3>🖼️ Cover Image</h3>
				<div class="form-group">
					<input type="url" id="cover_image" name="cover_image" value={data.post.cover_image || ''} placeholder="https://example.com/image.jpg" />
				</div>
				{#if data.post.cover_image}
					<img src={data.post.cover_image} alt="Cover preview" class="cover-preview" />
				{/if}
			</div>

			<div class="card">
				<h3>🧳 Trip</h3>
				<div class="form-group">
					<select name="trip_id" id="trip_id">
						<option value="">No trip</option>
						{#each data.trips as trip}
							<option value={trip.id} selected={data.post.trip_id === trip.id}>{trip.name}</option>
						{/each}
					</select>
				</div>
				{#if data.trips.length === 0}
					<a href="/admin/trips" class="btn-link">+ Create a trip</a>
				{/if}
			</div>

			<div class="card">
				<h3>📂 Category</h3>
				<div class="form-group">
					<select name="category_id" id="category_id">
						<option value="">No category</option>
						{#each data.categories as category}
							<option value={category.id} selected={data.post.category_id === category.id}>{category.icon} {category.name}</option>
						{/each}
					</select>
				</div>
			</div>

			<div class="card">
				<h3>🏷️ Tags</h3>
				<div class="tags-list">
					{#each data.tags as tag}
						<label class="tag-checkbox">
							<input type="checkbox" name="tags" value={tag.id} checked={data.postTags.some(t => t.id === tag.id)} />
							<span class="tag-label" style="background-color: {tag.color}">{tag.name}</span>
						</label>
					{/each}
					{#if data.tags.length === 0}
						<a href="/admin/tags" class="btn-link">+ Create tags</a>
					{/if}
				</div>
			</div>

			<div class="card">
				<h3>📍 Location</h3>
				<div class="form-group">
					<input type="text" id="location" name="location" value={data.post.location || ''} placeholder="Paris, France" />
				</div>
				<div class="form-row">
					<div class="form-group">
						<label for="latitude">Lat</label>
						<input type="number" step="any" id="latitude" name="latitude" value={data.post.latitude || ''} placeholder="48.8566" />
					</div>
					<div class="form-group">
						<label for="longitude">Long</label>
						<input type="number" step="any" id="longitude" name="longitude" value={data.post.longitude || ''} placeholder="2.3522" />
					</div>
				</div>
			</div>

			<div class="card">
				<h3>🍽️ Place Review</h3>
				<div class="form-group">
					<label for="place_name">Place Name</label>
					<input type="text" id="place_name" name="place_name" value={data.post.place_name || ''} placeholder="Restaurant Name" />
				</div>
				<div class="form-group">
					<label for="place_address">Address</label>
					<input type="text" id="place_address" name="place_address" value={data.post.place_address || ''} placeholder="123 Main St" />
				</div>
				<div class="form-row">
					<div class="form-group">
						<label for="place_phone">Phone</label>
						<input type="tel" id="place_phone" name="place_phone" value={data.post.place_phone || ''} placeholder="+1 234 567" />
					</div>
					<div class="form-group">
						<label for="place_website">Website</label>
						<input type="url" id="place_website" name="place_website" value={data.post.place_website || ''} placeholder="https://" />
					</div>
				</div>
				<div class="form-group">
					<label for="place_hours">Hours</label>
					<input type="text" id="place_hours" name="place_hours" value={data.post.place_hours || ''} placeholder="Mon-Fri 9am-10pm" />
				</div>
				<div class="form-row">
					<div class="form-group">
						<label for="rating">Rating</label>
						<select name="rating" id="rating">
							<option value="">—</option>
							<option value="5" selected={data.post.rating === 5}>⭐⭐⭐⭐⭐</option>
							<option value="4" selected={data.post.rating === 4}>⭐⭐⭐⭐</option>
							<option value="3" selected={data.post.rating === 3}>⭐⭐⭐</option>
							<option value="2" selected={data.post.rating === 2}>⭐⭐</option>
							<option value="1" selected={data.post.rating === 1}>⭐</option>
						</select>
					</div>
					<div class="form-group">
						<label for="price_range">Price</label>
						<select name="price_range" id="price_range">
							<option value="">—</option>
							<option value="1" selected={data.post.price_range === 1}>$</option>
							<option value="2" selected={data.post.price_range === 2}>$$</option>
							<option value="3" selected={data.post.price_range === 3}>$$$</option>
							<option value="4" selected={data.post.price_range === 4}>$$$$</option>
						</select>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="form-actions">
		<button type="submit" class="btn btn-primary">💾 Save Changes</button>
		<a href="/admin/posts" class="btn btn-outline">Cancel</a>
	</div>
</form>

<form method="POST" action="?/delete" use:enhance class="delete-form">
	<button type="submit" class="btn btn-danger" onclick={(e) => {
		if (!confirm('Delete this post permanently?')) e.preventDefault();
	}}>🗑️ Delete Post</button>
</form>

<!-- Gallery Section -->
<div class="section" style="margin-top: 2rem;">
	<div class="section-header">
		<h2>📷 Photo Gallery</h2>
		<button class="btn btn-sm btn-outline" onclick={() => showGallery = !showGallery}>
			{showGallery ? 'Hide' : 'Add Photos'}
		</button>
	</div>

	{#if data.galleryImages.length > 0}
		<div class="gallery-grid">
			{#each data.galleryImages as photo}
				<div class="gallery-item">
					<img src="/photos/{photo.filename}" alt={photo.caption || ''} />
					<form method="POST" action="?/removeGalleryImage" use:enhance>
						<input type="hidden" name="photo_id" value={photo.id} />
						<button type="submit" class="remove-btn">✕</button>
					</form>
				</div>
			{/each}
		</div>
	{:else}
		<p class="empty-state">No photos in gallery. Add some below!</p>
	{/if}

	{#if showGallery}
		<div class="photo-picker">
			<h4>Select photos to add:</h4>
			<div class="photos-grid">
				{#each data.photos.filter(p => !data.galleryImages.some(g => g.id === p.id)) as photo}
					<form method="POST" action="?/addGalleryImage" use:enhance class="photo-option">
						<input type="hidden" name="photo_id" value={photo.id} />
						<button type="submit">
							<img src="/photos/{photo.filename}" alt={photo.caption || ''} />
						</button>
					</form>
				{/each}
			</div>
			{#if data.photos.length === 0}
				<a href="/admin/photos/upload" class="btn btn-outline">Upload photos first</a>
			{/if}
		</div>
	{/if}
</div>

<style>
	.header-actions {
		display: flex;
		gap: 0.5rem;
	}

	.form-grid {
		display: grid;
		grid-template-columns: 1fr 280px;
		gap: 1.5rem;
	}

	@media (max-width: 900px) {
		.form-grid {
			grid-template-columns: 1fr;
		}
	}

	.main-column, .sidebar-column {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.card {
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 1rem;
	}

	.card h3 {
		margin: 0 0 1rem;
		font-size: 0.95rem;
		color: var(--text);
	}

	.form-group {
		margin-bottom: 0.75rem;
	}

	.form-group:last-child {
		margin-bottom: 0;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text);
	}

	.hint {
		font-weight: 400;
		color: var(--text-muted);
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}

	.tags-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
		padding: 0.5rem;
		background: var(--bg-secondary, #f9fafb);
		border-radius: var(--radius);
		min-height: 2.5rem;
	}

	.tag-checkbox {
		cursor: pointer;
	}

	.tag-checkbox input {
		display: none;
	}

	.tag-label {
		display: inline-block;
		padding: 0.25rem 0.625rem;
		border-radius: 1rem;
		font-size: 0.75rem;
		font-weight: 500;
		color: #fff;
		opacity: 0.4;
		transition: all 0.15s ease;
		border: 2px solid transparent;
	}

	.tag-checkbox:hover .tag-label {
		opacity: 0.7;
	}

	.tag-checkbox input:checked + .tag-label {
		opacity: 1;
		box-shadow: 0 1px 3px rgba(0,0,0,0.2);
	}

	.btn-link {
		color: var(--primary);
		text-decoration: none;
		font-size: 0.875rem;
	}

	.btn-link:hover {
		text-decoration: underline;
	}

	.cover-preview {
		width: 100%;
		border-radius: var(--radius);
		margin-top: 0.5rem;
	}

	.form-actions {
		display: flex;
		gap: 1rem;
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--border);
	}

	:global(.delete-form) {
		display: inline-block;
		margin-left: 1rem;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.section-header h2 {
		margin: 0;
	}

	.gallery-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 1rem;
	}

	.gallery-item {
		position: relative;
	}

	.gallery-item img {
		width: 100%;
		aspect-ratio: 1;
		object-fit: cover;
		border-radius: var(--radius);
	}

	.remove-btn {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		background: rgba(0, 0, 0, 0.7);
		color: white;
		border: none;
		border-radius: 50%;
		width: 24px;
		height: 24px;
		cursor: pointer;
	}

	.photo-picker {
		margin-top: 1.5rem;
		padding: 1rem;
		background: var(--card);
		border-radius: var(--radius);
	}

	.photo-picker h4 {
		margin: 0 0 1rem;
	}

	.photos-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
		gap: 0.5rem;
	}

	.photo-option button {
		border: none;
		padding: 0;
		background: none;
		cursor: pointer;
	}

	.photo-option img {
		width: 100%;
		aspect-ratio: 1;
		object-fit: cover;
		border-radius: var(--radius);
		transition: transform 0.2s;
	}

	.photo-option img:hover {
		transform: scale(1.05);
	}

	.empty-state {
		text-align: center;
		color: var(--text-light);
		padding: 1rem;
	}
</style>
