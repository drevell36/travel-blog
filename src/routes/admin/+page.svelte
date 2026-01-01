<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Dashboard - Admin</title>
</svelte:head>

<div class="page-header">
	<h1>Dashboard</h1>
	<p>Welcome back, {data.user.username}!</p>
</div>

<div class="grid grid-3" style="margin-top: 2rem;">
	<div class="stat-card">
		<div class="stat-value">{data.stats.totalPosts}</div>
		<div class="stat-label">Total Posts</div>
	</div>
	<div class="stat-card">
		<div class="stat-value">{data.stats.publishedPosts}</div>
		<div class="stat-label">Published</div>
	</div>
	<div class="stat-card">
		<div class="stat-value">{data.stats.totalPhotos}</div>
		<div class="stat-label">Photos</div>
	</div>
</div>

<div style="margin-top: 3rem; display: flex; gap: 1rem;">
	<a href="/admin/posts/new" class="btn btn-primary">✏️ New Post</a>
	<a href="/admin/photos/upload" class="btn btn-secondary">📷 Upload Photos</a>
</div>

<style>
	.stat-card {
		background: var(--background);
		padding: 2rem;
		border-radius: var(--radius);
		text-align: center;
	}

	.stat-value {
		font-size: 3rem;
		font-weight: 800;
		color: var(--primary);
	}

	.stat-label {
		color: var(--text-light);
		margin-top: 0.5rem;
	}
</style>
