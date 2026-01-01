<script lang="ts">
	import { enhance } from '$app/forms';
	import MarkdownEditor from '$lib/components/MarkdownEditor.svelte';
	import OcrScanner from '$lib/components/OcrScanner.svelte';
	
	let { data, form } = $props();
	
	let content = $state('');
	
	function handleOcrText(text: string) {
		content = content ? content + '\n\n' + text : text;
	}
</script>

<svelte:head>
	<title>New Post - Admin</title>
</svelte:head>

<div class="page-header">
	<h1>✨ Create New Post</h1>
	<a href="/admin/posts" class="btn btn-outline">← Back</a>
</div>

{#if form?.error}
	<div class="alert alert-error">{form.error}</div>
{/if}

<form method="POST" use:enhance>
	<div class="form-grid">
		<div class="main-column">
			<div class="form-group">
				<label for="title">Title *</label>
				<input type="text" id="title" name="title" required placeholder="My Amazing Adventure" />
			</div>

			<div class="form-group">
				<label for="excerpt">Excerpt</label>
				<textarea id="excerpt" name="excerpt" rows="2" placeholder="Brief summary for cards and SEO"></textarea>
			</div>

			<div class="form-group">
				<label for="content">Content * <span class="hint">(Markdown supported)</span></label>
				<OcrScanner onTextExtracted={handleOcrText} />
				<MarkdownEditor bind:value={content} id="content" name="content" />
			</div>

			<div class="form-group">
				<label for="video_url">Video URL</label>
				<input type="url" id="video_url" name="video_url" placeholder="https://youtube.com/embed/..." />
			</div>
		</div>

		<div class="sidebar-column">
			<div class="card">
				<h3>📤 Publish</h3>
				<div class="form-group">
					<label for="status">Status</label>
					<select name="status" id="status">
						<option value="draft">Draft</option>
						<option value="published">Published</option>
						<option value="scheduled">Scheduled</option>
					</select>
				</div>
				<div class="form-group">
					<label for="scheduled_for">Schedule Date</label>
					<input type="datetime-local" id="scheduled_for" name="scheduled_for" />
				</div>
			</div>

			<div class="card">
				<h3>🖼️ Cover Image</h3>
				<div class="form-group">
					<input type="url" id="cover_image" name="cover_image" placeholder="https://example.com/image.jpg" />
				</div>
			</div>

			<div class="card">
				<h3>🧳 Trip</h3>
				<div class="form-group">
					<select name="trip_id" id="trip_id">
						<option value="">No trip</option>
						{#each data.trips as trip}
							<option value={trip.id}>{trip.name}</option>
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
							<option value={category.id}>{category.icon} {category.name}</option>
						{/each}
					</select>
				</div>
			</div>

			<div class="card">
				<h3>🏷️ Tags</h3>
				<div class="tags-list">
					{#each data.tags as tag}
						<label class="tag-checkbox">
							<input type="checkbox" name="tags" value={tag.id} />
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
					<input type="text" id="location" name="location" placeholder="Paris, France" />
				</div>
				<div class="form-row">
					<div class="form-group">
						<label for="latitude">Lat</label>
						<input type="number" step="any" id="latitude" name="latitude" placeholder="48.8566" />
					</div>
					<div class="form-group">
						<label for="longitude">Long</label>
						<input type="number" step="any" id="longitude" name="longitude" placeholder="2.3522" />
					</div>
				</div>
			</div>

			<div class="card">
				<h3>🍽️ Place Review</h3>
				<div class="form-group">
					<label for="place_name">Place Name</label>
					<input type="text" id="place_name" name="place_name" placeholder="Restaurant Name" />
				</div>
				<div class="form-group">
					<label for="place_address">Address</label>
					<input type="text" id="place_address" name="place_address" placeholder="123 Main St" />
				</div>
				<div class="form-row">
					<div class="form-group">
						<label for="place_phone">Phone</label>
						<input type="tel" id="place_phone" name="place_phone" placeholder="+1 234 567" />
					</div>
					<div class="form-group">
						<label for="place_website">Website</label>
						<input type="url" id="place_website" name="place_website" placeholder="https://" />
					</div>
				</div>
				<div class="form-group">
					<label for="place_hours">Hours</label>
					<input type="text" id="place_hours" name="place_hours" placeholder="Mon-Fri 9am-10pm" />
				</div>
				<div class="form-row">
					<div class="form-group">
						<label for="rating">Rating</label>
						<select name="rating" id="rating">
							<option value="">—</option>
							<option value="5">⭐⭐⭐⭐⭐</option>
							<option value="4">⭐⭐⭐⭐</option>
							<option value="3">⭐⭐⭐</option>
							<option value="2">⭐⭐</option>
							<option value="1">⭐</option>
						</select>
					</div>
					<div class="form-group">
						<label for="price_range">Price</label>
						<select name="price_range" id="price_range">
							<option value="">—</option>
							<option value="1">$</option>
							<option value="2">$$</option>
							<option value="3">$$$</option>
							<option value="4">$$$$</option>
						</select>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="form-actions">
		<button type="submit" class="btn btn-primary">Create Post</button>
		<a href="/admin/posts" class="btn btn-outline">Cancel</a>
	</div>
</form>

<style>
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

	.form-actions {
		display: flex;
		gap: 1rem;
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--border);
	}
</style>
