<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>{data.query ? `Search: ${data.query}` : 'Search'} - Travel Blog</title>
</svelte:head>

<div class="page-header">
	<h1>🔍 Search</h1>
</div>

<form method="GET" class="search-form">
	<input type="text" name="q" value={data.query} placeholder="Search posts..." />
	<button type="submit" class="btn btn-primary">Search</button>
</form>

{#if data.query}
	<p class="results-count">Found {data.posts.length} result{data.posts.length !== 1 ? 's' : ''} for "{data.query}"</p>

	<div class="posts-grid">
		{#each data.posts as post}
			<a href="/post/{post.slug}" class="post-card">
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
				</div>
			</a>
		{:else}
			<p class="no-results">No posts found matching your search.</p>
		{/each}
	</div>
{/if}

<style>
	.search-form {
		display: flex;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.search-form input {
		flex: 1;
		font-size: 1.125rem;
	}

	.results-count {
		color: var(--text-light);
		margin-bottom: 1.5rem;
	}

	.posts-grid {
		display: grid;
		gap: 1.5rem;
	}

	.post-card {
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

	.post-card:hover {
		transform: translateY(-2px);
	}

	.post-card img {
		width: 100%;
		height: 150px;
		object-fit: cover;
	}

	.post-info {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.post-info h3 {
		margin: 0 0 0.5rem;
	}

	.location {
		color: var(--text-light);
		font-size: 0.875rem;
		margin-bottom: 0.5rem;
	}

	.post-info p {
		color: var(--text-light);
		margin: 0;
		font-size: 0.875rem;
	}

	.no-results {
		grid-column: 1 / -1;
		text-align: center;
		color: var(--text-light);
		padding: 3rem;
	}

	@media (max-width: 600px) {
		.post-card {
			grid-template-columns: 1fr;
		}

		.post-card img {
			height: 200px;
		}
	}
</style>
