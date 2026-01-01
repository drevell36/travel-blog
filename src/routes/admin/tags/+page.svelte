<script lang="ts">
	import { enhance } from '$app/forms';
	
	let { data, form } = $props();
	let editingTag = $state<string | null>(null);
	let selectedColor = $state('#3b82f6');
	let editColor = $state('#3b82f6');
	
	const colors = [
		'#ef4444', '#f97316', '#eab308', '#22c55e',
		'#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'
	];
</script>

<svelte:head>
	<title>Tags - Admin</title>
</svelte:head>

<div class="page-header">
	<h1>🏷️ Tags</h1>
	<p>Organize your posts with tags</p>
</div>

{#if form?.error}
	<div class="alert alert-error">{form.error}</div>
{/if}

{#if form?.success}
	<div class="alert alert-success">Tag saved successfully!</div>
{/if}

<!-- Create new tag form -->
<div class="card create-card">
	<h3>➕ Create New Tag</h3>
	<form method="POST" action="?/create" use:enhance class="create-form">
		<input type="text" name="name" placeholder="Tag name" required class="tag-input" />
		<input type="hidden" name="color" value={selectedColor} />
		<div class="color-swatches">
			{#each colors as color}
				<button 
					type="button" 
					class="color-swatch" 
					class:selected={selectedColor === color}
					style="background-color: {color}"
					aria-label="Select {color}"
					onclick={() => selectedColor = color}
				></button>
			{/each}
		</div>
		<button type="submit" class="btn btn-primary">Add</button>
	</form>
</div>

<!-- Tags list -->
<div class="tags-grid">
	{#each data.tags as tag}
		<div class="tag-card" style="border-left: 4px solid {tag.color}">
			{#if editingTag === tag.id}
			<form method="POST" action="?/update" use:enhance class="edit-form">
					<input type="hidden" name="id" value={tag.id} />
					<div class="edit-fields">
						<input type="text" name="name" value={tag.name} required />
						<input type="hidden" name="color" value={editColor} />
						<div class="color-swatches small">
							{#each colors as color}
								<button 
									type="button" 
									class="color-swatch" 
									class:selected={editColor === color}
									style="background-color: {color}"
									aria-label="Select {color}"
									onclick={() => editColor = color}
								></button>
							{/each}
						</div>
					</div>
					<div class="tag-actions">
						<button type="submit" class="btn btn-sm btn-primary">Save</button>
						<button type="button" class="btn btn-sm btn-outline" onclick={() => editingTag = null}>Cancel</button>
					</div>
				</form>
			{:else}
				<div class="tag-info">
					<span class="tag-badge" style="background-color: {tag.color}">{tag.name}</span>
					<span class="tag-meta">{tag.slug}</span>
				</div>
				<div class="tag-actions">
					<button class="btn btn-sm btn-ghost" aria-label="Edit tag" onclick={() => { editingTag = tag.id; editColor = tag.color; }}>✏️</button>
					<form method="POST" action="?/delete" use:enhance class="inline-delete">
						<input type="hidden" name="id" value={tag.id} />
						<button type="submit" class="btn btn-sm btn-ghost btn-ghost-danger" aria-label="Delete tag" onclick={(e) => {
							if (!confirm('Delete this tag?')) e.preventDefault();
						}}>🗑️</button>
					</form>
				</div>
			{/if}
		</div>
	{:else}
		<p class="empty-state">No tags yet. Create your first tag above!</p>
	{/each}
</div>

<style>
	.create-card {
		margin-bottom: 2rem;
	}

	.create-card h3 {
		margin: 0 0 1rem;
	}

	.create-form {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.tag-input {
		width: 200px;
		flex: none;
		padding-left: 0.75rem;
		margin-left: 0.5rem;
	}

	.color-swatches {
		display: flex;
		gap: 0.375rem;
		align-items: center;
	}

	.color-swatches.small {
		gap: 0.25rem;
	}

	.color-swatch {
		width: 24px;
		height: 24px;
		border: 2px solid transparent;
		border-radius: 50%;
		cursor: pointer;
		transition: transform 0.1s, border-color 0.1s;
	}

	.color-swatches.small .color-swatch {
		width: 20px;
		height: 20px;
	}

	.color-swatch:hover {
		transform: scale(1.15);
	}

	.color-swatch.selected {
		border-color: var(--text);
	}

	.tags-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 0.75rem;
	}

	.tag-card {
		background: var(--card);
		padding: 0.875rem 1rem;
		border-radius: var(--radius);
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.75rem;
		transition: box-shadow 0.15s ease;
	}

	.tag-card:hover {
		box-shadow: 0 2px 8px rgba(0,0,0,0.08);
	}

	.tag-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex: 1;
		min-width: 0;
	}

	.tag-badge {
		color: white;
		padding: 0.25rem 0.75rem;
		border-radius: 1rem;
		font-weight: 500;
		font-size: 0.875rem;
		white-space: nowrap;
	}

	.tag-meta {
		color: var(--text-muted);
		font-size: 0.8rem;
		font-family: monospace;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.tag-actions {
		display: flex;
		gap: 0.25rem;
		flex-shrink: 0;
	}

	.btn-ghost {
		background: transparent;
		border: none;
		padding: 0.375rem 0.5rem;
		border-radius: var(--radius);
		cursor: pointer;
		font-size: 1rem;
		transition: background 0.15s;
	}

	.btn-ghost:hover {
		background: var(--bg-secondary, #f3f4f6);
	}

	.btn-ghost-danger:hover {
		background: #fee2e2;
	}

	.inline-delete {
		display: inline;
	}

	.edit-form {
		display: flex;
		gap: 0.75rem;
		align-items: center;
		width: 100%;
	}

	.edit-fields {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		flex: 1;
	}

	.edit-fields input[type="text"] {
		flex: 1;
		min-width: 120px;
	}

	.empty-state {
		grid-column: 1 / -1;
		text-align: center;
		color: var(--text-muted);
		padding: 3rem;
		background: var(--card);
		border-radius: var(--radius);
	}
</style>
