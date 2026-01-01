<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>{data.trip.name} - Travel Blog</title>
	<meta name="description" content={data.trip.description || `Posts from ${data.trip.name}`} />
</svelte:head>

{#if data.trip.cover_image}
	<div class="trip-hero" style="background-image: url({data.trip.cover_image})">
		<div class="hero-overlay">
			<h1>{data.trip.name}</h1>
			{#if data.trip.start_date}
				<p class="dates">
					📅 {new Date(data.trip.start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
					{#if data.trip.end_date}
						- {new Date(data.trip.end_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
					{/if}
				</p>
			{/if}
		</div>
	</div>
{:else}
	<div class="page-header">
		<a href="/" class="back-link">← All Posts</a>
		<h1>🧳 {data.trip.name}</h1>
		{#if data.trip.start_date}
			<p class="dates">
				📅 {new Date(data.trip.start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
				{#if data.trip.end_date}
					- {new Date(data.trip.end_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
				{/if}
			</p>
		{/if}
	</div>
{/if}

{#if data.trip.description}
	<p class="trip-description">{data.trip.description}</p>
{/if}

<div class="trip-stats">
	<div class="stat">
		<span class="stat-value">{data.posts.length}</span>
		<span class="stat-label">Posts</span>
	</div>
</div>

<h2>Posts from this trip</h2>

<div class="posts-list">
	{#each data.posts as post}
		<a href="/post/{post.slug}" class="post-item">
			{#if post.cover_image}
				<img src={post.cover_image} alt={post.title} />
			{/if}
			<div class="post-info">
				<h3>{post.title}</h3>
				{#if post.location}
					<span class="location">📍 {post.location}</span>
				{/if}
				{#if post.excerpt}
					<p>{post.excerpt}</p>
				{/if}
				<div class="post-meta">
					<span class="date">{new Date(post.created_at).toLocaleDateString()}</span>
				</div>
			</div>
		</a>
	{:else}
		<p class="no-posts">No posts in this trip yet.</p>
	{/each}
</div>

<style>
	.trip-hero {
		margin: -2rem -2rem 2rem;
		height: 300px;
		background-size: cover;
		background-position: center;
		display: flex;
		align-items: flex-end;
	}

	.hero-overlay {
		width: 100%;
		padding: 2rem;
		background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
		color: white;
	}

	.hero-overlay h1 {
		margin: 0;
		font-size: 2.5rem;
	}

	.dates {
		margin: 0.5rem 0 0;
		opacity: 0.9;
	}

	.back-link {
		color: var(--text-light);
		text-decoration: none;
		font-size: 0.875rem;
	}

	.trip-description {
		font-size: 1.125rem;
		color: var(--text-light);
		margin-bottom: 2rem;
		line-height: 1.8;
	}

	.trip-stats {
		display: flex;
		gap: 2rem;
		margin-bottom: 2rem;
		flex-wrap: wrap;
	}

	.stat {
		text-align: center;
	}

	.stat-value {
		display: block;
		font-size: 2rem;
		font-weight: 700;
		color: var(--primary);
	}

	.stat-label {
		font-size: 0.875rem;
		color: var(--text-light);
	}

	h2 {
		margin-bottom: 1.5rem;
	}

	.posts-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.post-item {
		display: grid;
		grid-template-columns: 200px 1fr;
		gap: 1.5rem;
		background: var(--card);
		border-radius: var(--radius);
		overflow: hidden;
		text-decoration: none;
		color: inherit;
		transition: transform 0.2s;
	}

	.post-item:hover {
		transform: translateX(4px);
	}

	.post-item img {
		width: 100%;
		height: 150px;
		object-fit: cover;
	}

	.post-info {
		padding: 1rem 1rem 1rem 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.post-info h3 {
		margin: 0 0 0.25rem;
	}

	.location {
		color: var(--text-light);
		font-size: 0.875rem;
	}

	.post-info p {
		color: var(--text-light);
		margin: 0.5rem 0;
		font-size: 0.875rem;
	}

	.post-meta {
		display: flex;
		gap: 1rem;
		font-size: 0.75rem;
		color: var(--text-light);
		margin-top: 0.5rem;
	}

	.no-posts {
		text-align: center;
		color: var(--text-light);
		padding: 3rem;
	}

	@media (max-width: 600px) {
		.post-item {
			grid-template-columns: 1fr;
		}

		.post-item img {
			height: 200px;
		}

		.post-info {
			padding: 1rem;
		}
	}
</style>
