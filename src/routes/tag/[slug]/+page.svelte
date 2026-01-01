<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Posts tagged "{data.tag.name}" - Travel Blog</title>
</svelte:head>

<div class="page-header">
	<a href="/" class="back-link">← All Posts</a>
	<h1>
		<span class="tag-badge" style="background-color: {data.tag.color}">{data.tag.name}</span>
	</h1>
	<p>{data.posts.length} post{data.posts.length !== 1 ? 's' : ''}</p>
</div>

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
				<span class="date">{new Date(post.created_at).toLocaleDateString()}</span>
			</div>
		</a>
	{:else}
		<p class="no-posts">No posts with this tag yet.</p>
	{/each}
</div>

<style>
	.back-link {
		color: var(--text-light);
		text-decoration: none;
		font-size: 0.875rem;
	}

	.back-link:hover {
		color: var(--primary);
	}

	.tag-badge {
		color: white;
		padding: 0.5rem 1.5rem;
		border-radius: 2rem;
		font-size: 1.5rem;
	}

	.posts-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 2rem;
	}

	.post-card {
		background: var(--card);
		border-radius: var(--radius);
		overflow: hidden;
		text-decoration: none;
		color: inherit;
		transition: transform 0.2s;
	}

	.post-card:hover {
		transform: translateY(-4px);
	}

	.post-card img {
		width: 100%;
		height: 200px;
		object-fit: cover;
	}

	.post-info {
		padding: 1.5rem;
	}

	.post-info h3 {
		margin: 0 0 0.5rem;
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

	.date {
		font-size: 0.75rem;
		color: var(--text-light);
	}

	.no-posts {
		grid-column: 1 / -1;
		text-align: center;
		color: var(--text-light);
		padding: 3rem;
	}
</style>
