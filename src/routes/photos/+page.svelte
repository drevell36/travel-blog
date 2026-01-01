<script lang="ts">
	let { data } = $props();
	let selectedPhoto = $state<typeof data.photos[0] | null>(null);
</script>

<svelte:head>
	<title>Photos - Travel Blog</title>
</svelte:head>

<div class="page-header">
	<h1>Photo Gallery</h1>
	<p>Captured moments from my adventures around the world</p>
</div>

{#if data.photos.length > 0}
	<div class="photo-grid">
		{#each data.photos as photo}
			<button class="photo-item" onclick={() => selectedPhoto = photo}>
				<img src="/photos/{photo.filename}" alt={photo.caption || 'Travel photo'} />
				<div class="photo-overlay">
					{#if photo.caption}
						<p>{photo.caption}</p>
					{/if}
					{#if photo.location}
						<small>📍 {photo.location}</small>
					{/if}
				</div>
			</button>
		{/each}
	</div>
{:else}
	<section style="text-align: center; padding: 4rem 2rem;">
		<h2>No photos yet</h2>
		<p style="color: var(--text-light); margin-top: 1rem;">Check back soon for travel photos!</p>
	</section>
{/if}

{#if selectedPhoto}
	<div class="lightbox" onclick={() => selectedPhoto = null} onkeydown={(e) => e.key === 'Escape' && (selectedPhoto = null)} role="button" tabindex="0">
		<button class="lightbox-close" onclick={() => selectedPhoto = null}>×</button>
		<div onclick={(e) => e.stopPropagation()} onkeydown={() => {}} role="button" tabindex="0">
			<img src="/photos/{selectedPhoto.filename}" alt={selectedPhoto.caption || 'Travel photo'} />
			{#if selectedPhoto.caption || selectedPhoto.location}
				<div style="color: white; text-align: center; margin-top: 1rem;">
					{#if selectedPhoto.caption}<p>{selectedPhoto.caption}</p>{/if}
					{#if selectedPhoto.location}<small>📍 {selectedPhoto.location}</small>{/if}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.photo-item {
		border: none;
		padding: 0;
		background: none;
		text-align: left;
	}
</style>
