<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Manage Photos - Admin</title>
</svelte:head>

<div class="page-header" style="display: flex; justify-content: space-between; align-items: center;">
	<div>
		<h1>Photos</h1>
		<p>Manage your photo gallery</p>
	</div>
	<a href="/admin/photos/upload" class="btn btn-primary">+ Upload Photos</a>
</div>

{#if data.photos.length > 0}
	<div class="photo-grid">
		{#each data.photos as photo}
			<div class="photo-admin-item">
				<img src="/photos/{photo.filename}" alt={photo.caption || 'Photo'} />
				<div class="photo-admin-overlay">
					<a href="/admin/photos/{photo.id}" class="btn btn-outline" style="padding: 0.5rem 1rem;">Edit</a>
					<form method="POST" action="/admin/photos/{photo.id}?/delete" style="display: inline;">
						<button type="submit" class="btn btn-danger" style="padding: 0.5rem 1rem;" onclick={(e) => { if (!confirm('Delete this photo?')) e.preventDefault(); }}>Delete</button>
					</form>
				</div>
				{#if photo.caption}
					<div class="photo-admin-caption">{photo.caption}</div>
				{/if}
			</div>
		{/each}
	</div>
{:else}
	<section style="text-align: center; padding: 4rem 2rem;">
		<h2>No photos yet</h2>
		<p style="color: var(--text-light); margin-top: 1rem;">Upload some photos from your travels!</p>
		<a href="/admin/photos/upload" class="btn btn-primary" style="margin-top: 2rem;">Upload Photos</a>
	</section>
{/if}

<style>
	.photo-admin-item {
		position: relative;
		border-radius: var(--radius);
		overflow: hidden;
		aspect-ratio: 1;
	}

	.photo-admin-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.photo-admin-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		opacity: 0;
		transition: opacity 0.2s;
	}

	.photo-admin-item:hover .photo-admin-overlay {
		opacity: 1;
	}

	.photo-admin-caption {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 0.5rem;
		background: rgba(0, 0, 0, 0.7);
		color: white;
		font-size: 0.875rem;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
	}
</style>
