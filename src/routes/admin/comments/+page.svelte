<script lang="ts">
	import { enhance } from '$app/forms';
	
	let { data, form } = $props();
</script>

<svelte:head>
	<title>Comments - Admin</title>
</svelte:head>

<div class="page-header">
	<h1>💬 Comments</h1>
	<p>Moderate reader comments</p>
</div>

{#if form?.error}
	<div class="alert alert-error">{form.error}</div>
{/if}

{#if form?.success}
	<div class="alert alert-success">Comment updated!</div>
{/if}

<div class="filter-tabs">
	<a href="?filter=pending" class="tab" class:active={data.filter === 'pending'}>
		⏳ Pending
	</a>
	<a href="?filter=all" class="tab" class:active={data.filter === 'all'}>
		📋 All Comments
	</a>
</div>

<div class="comments-list">
	{#each data.comments as comment}
		<div class="comment-card" class:pending={!comment.approved}>
			<div class="comment-header">
				<div class="comment-author">
					<strong>{comment.author_name}</strong>
					{#if comment.author_email}
						<span class="email">{comment.author_email}</span>
					{/if}
				</div>
				<span class="comment-date">{new Date(comment.created_at).toLocaleString()}</span>
			</div>
			
			<div class="comment-post">
				On: <a href="/admin/posts/{comment.post_id}">{comment.post_title}</a>
			</div>
			
			<div class="comment-content">
				{comment.content}
			</div>
			
			<div class="comment-actions">
				{#if !comment.approved}
					<form method="POST" action="?/approve" use:enhance style="display: inline;">
						<input type="hidden" name="id" value={comment.id} />
						<button type="submit" class="btn btn-sm btn-primary">✓ Approve</button>
					</form>
				{:else}
					<span class="approved-badge">✓ Approved</span>
				{/if}
				<form method="POST" action="?/delete" use:enhance style="display: inline;">
					<input type="hidden" name="id" value={comment.id} />
					<button type="submit" class="btn btn-sm btn-danger" onclick={(e) => {
						if (!confirm('Delete this comment?')) e.preventDefault();
					}}>Delete</button>
				</form>
			</div>
		</div>
	{:else}
		<p class="empty-state">
			{#if data.filter === 'pending'}
				No pending comments. All caught up! 🎉
			{:else}
				No comments yet.
			{/if}
		</p>
	{/each}
</div>

<style>
	.filter-tabs {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.tab {
		padding: 0.75rem 1.5rem;
		background: var(--card);
		border-radius: var(--radius);
		text-decoration: none;
		color: var(--text);
	}

	.tab.active {
		background: var(--primary);
		color: white;
	}

	.comments-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.comment-card {
		background: var(--card);
		border-radius: var(--radius);
		padding: 1.5rem;
		border-left: 4px solid var(--success);
	}

	.comment-card.pending {
		border-left-color: var(--warning);
	}

	.comment-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.comment-author .email {
		color: var(--text-light);
		font-size: 0.875rem;
		margin-left: 0.5rem;
	}

	.comment-date {
		color: var(--text-light);
		font-size: 0.875rem;
	}

	.comment-post {
		font-size: 0.875rem;
		color: var(--text-light);
		margin-bottom: 1rem;
	}

	.comment-post a {
		color: var(--primary);
	}

	.comment-content {
		background: var(--background);
		padding: 1rem;
		border-radius: var(--radius);
		margin-bottom: 1rem;
		white-space: pre-wrap;
	}

	.comment-actions {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.approved-badge {
		background: var(--success);
		color: white;
		padding: 0.25rem 0.75rem;
		border-radius: 1rem;
		font-size: 0.75rem;
	}

	.empty-state {
		text-align: center;
		color: var(--text-light);
		padding: 3rem;
		background: var(--card);
		border-radius: var(--radius);
	}
</style>
