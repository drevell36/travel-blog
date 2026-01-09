<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Travel Blog - Adventures Around the World</title>
</svelte:head>

<div class="hero">
	<h1>Adventures Around the World</h1>
	<p>Join me as I explore new places, discover hidden gems, and share stories from the road.</p>
</div>

{#if data.posts.length > 0}
	<section>
		<div class="page-header">
			<h2>Latest Posts</h2>
		</div>
		<div class="grid grid-2">
			{#each data.posts as post}
				<a href="/post/{post.slug}" class="card">
					{#if post.cover_image}
						<img src={post.cover_image} alt={post.title} class="card-image" />
					{:else}
						<div class="card-image" style="background: linear-gradient(135deg, #667eea, #764ba2);"></div>
					{/if}
					<div class="card-content">
						<h3 class="card-title">{post.title}</h3>
						<div class="card-meta">
							{#if post.location}📍 {post.location} • {/if}
							{new Date(post.created_at).toLocaleDateString()}
						</div>
						{#if post.excerpt}
							<p class="card-excerpt">{post.excerpt}</p>
						{/if}
					</div>
				</a>
			{/each}
		</div>
	</section>
{:else}
	<section style="text-align: center; padding: 4rem 2rem;">
		<h2>No posts yet</h2>
		<p style="color: var(--text-light); margin-top: 1rem;">Check back soon for new adventures!</p>
		{#if data.user}
			<a href="/admin/posts/new" class="btn btn-primary" style="margin-top: 2rem;">Create your first post</a>
		{/if}
	</section>
{/if}

<style>
	.card {
		text-decoration: none;
		color: inherit;
		display: block;
	}
</style>
