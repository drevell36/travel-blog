<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>{data.category.name} - Travel Blog</title>
	<meta name="description" content={data.category.description || `Posts in ${data.category.name}`} />
</svelte:head>

<nav class="breadcrumbs">
	<a href="/">Home</a>
	<span>›</span>
	<a href="/posts">Posts</a>
	<span>›</span>
	<span class="current">{data.category.icon} {data.category.name}</span>
</nav>

<div class="page-header">
	<h1>{data.category.icon} {data.category.name}</h1>
	{#if data.category.description}
		<p>{data.category.description}</p>
	{/if}
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
				{#if post.rating}
					<span class="rating">{'⭐'.repeat(post.rating)}</span>
				{/if}
				{#if post.excerpt}
					<p>{post.excerpt}</p>
				{/if}
				<span class="date">{new Date(post.created_at).toLocaleDateString()}</span>
			</div>
		</a>
	{:else}
		<p class="no-posts">No posts in this category yet.</p>
	{/each}
</div>

<style>
	.breadcrumbs {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: var(--text-muted);
		margin-bottom: 1.5rem;
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
		padding: 1rem 1rem 1rem 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.post-info h3 {
		margin: 0;
		color: var(--text);
	}

	.location, .rating {
		font-size: 0.875rem;
		color: var(--text-muted);
	}

	.post-info p {
		margin: 0;
		color: var(--text-muted);
		font-size: 0.9rem;
	}

	.date {
		font-size: 0.8rem;
		color: var(--text-muted);
		margin-top: auto;
	}

	.no-posts {
		text-align: center;
		color: var(--text-muted);
		padding: 3rem;
	}

	@media (max-width: 600px) {
		.post-card {
			grid-template-columns: 1fr;
		}

		.post-card img {
			height: 200px;
		}

		.post-info {
			padding: 1rem;
		}
	}
</style>
