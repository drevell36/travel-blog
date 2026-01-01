<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Trips - Travel Blog</title>
	<meta name="description" content="Browse all my travel trips and adventures." />
</svelte:head>

<div class="page-header">
	<h1>🗺️ Trips</h1>
	<p class="subtitle">Browse all my adventures organized by trip</p>
</div>

{#if data.trips.length > 0}
	<div class="trips-grid">
		{#each data.trips as trip}
			<a href="/trip/{trip.slug}" class="trip-card">
				{#if trip.cover_image}
					<img src={trip.cover_image} alt={trip.name} class="trip-image" />
				{:else}
					<div class="trip-image placeholder">🌍</div>
				{/if}
				<div class="trip-content">
					<h2>{trip.name}</h2>
					{#if trip.description}
						<p class="description">{trip.description}</p>
					{/if}
					<div class="trip-meta">
						{#if trip.start_date}
							<span>📅 {new Date(trip.start_date).toLocaleDateString()}</span>
							{#if trip.end_date}
								<span> - {new Date(trip.end_date).toLocaleDateString()}</span>
							{/if}
						{/if}
					</div>
					<div class="trip-stats">
						<span>📝 {trip.postCount} posts</span>
					</div>
				</div>
			</a>
		{/each}
	</div>
{:else}
	<div class="empty-state">
		<p>No trips yet. Check back soon!</p>
	</div>
{/if}

<style>
	.subtitle {
		color: var(--text-light);
		margin-top: 0.5rem;
	}

	.trips-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 2rem;
		margin-top: 2rem;
	}

	.trip-card {
		background: var(--bg-secondary);
		border-radius: 12px;
		overflow: hidden;
		text-decoration: none;
		color: inherit;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.trip-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
	}

	.trip-image {
		width: 100%;
		height: 200px;
		object-fit: cover;
	}

	.trip-image.placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 4rem;
		background: linear-gradient(135deg, #667eea, #764ba2);
	}

	.trip-content {
		padding: 1.5rem;
	}

	.trip-content h2 {
		margin: 0 0 0.5rem 0;
		font-size: 1.5rem;
	}

	.description {
		color: var(--text-light);
		margin-bottom: 1rem;
		line-height: 1.6;
	}

	.trip-meta {
		font-size: 0.875rem;
		color: var(--text-light);
		margin-bottom: 0.5rem;
	}

	.trip-stats {
		display: flex;
		gap: 1rem;
		font-size: 0.875rem;
		color: var(--text-light);
	}

	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		color: var(--text-light);
	}
</style>
