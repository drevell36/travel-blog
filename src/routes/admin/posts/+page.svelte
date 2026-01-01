<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Manage Posts - Admin</title>
</svelte:head>

<div class="page-header" style="display: flex; justify-content: space-between; align-items: center;">
	<div>
		<h1>Posts</h1>
		<p>Manage your blog posts</p>
	</div>
	<a href="/admin/posts/new" class="btn btn-primary">+ New Post</a>
</div>

{#if data.posts.length > 0}
	<table class="table">
		<thead>
			<tr>
				<th>Title</th>
				<th>Location</th>
				<th>Status</th>
				<th>Created</th>
				<th>Actions</th>
			</tr>
		</thead>
		<tbody>
			{#each data.posts as post}
				<tr>
					<td>
						<strong>{post.title}</strong>
					</td>
					<td>{post.location || '—'}</td>
					<td>
						<span class="badge {post.published ? 'badge-published' : 'badge-draft'}">
							{post.published ? 'Published' : 'Draft'}
						</span>
					</td>
					<td>{new Date(post.created_at).toLocaleDateString()}</td>
					<td class="table-actions">
						<a href="/admin/posts/{post.id}" class="btn btn-outline" style="padding: 0.5rem 1rem;">Edit</a>
						<form method="POST" action="/admin/posts/{post.id}?/delete" style="display: inline;">
							<button type="submit" class="btn btn-danger" style="padding: 0.5rem 1rem;" onclick={(e) => { if (!confirm('Delete this post?')) e.preventDefault(); }}>Delete</button>
						</form>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{:else}
	<section style="text-align: center; padding: 4rem 2rem;">
		<h2>No posts yet</h2>
		<p style="color: var(--text-light); margin-top: 1rem;">Create your first post to get started!</p>
		<a href="/admin/posts/new" class="btn btn-primary" style="margin-top: 2rem;">Create Post</a>
	</section>
{/if}
