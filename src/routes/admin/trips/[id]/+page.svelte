<script lang="ts">
	import { enhance } from '$app/forms';
	
	let { data, form } = $props();
</script>

<svelte:head>
	<title>Edit {data.trip.name} - Admin</title>
</svelte:head>

<div class="page-header">
	<h1>Edit Trip</h1>
	<a href="/admin/trips" class="btn btn-outline">← Back to Trips</a>
</div>

{#if form?.error}
	<div class="alert alert-error">{form.error}</div>
{/if}

{#if form?.success}
	<div class="alert alert-success">Trip updated successfully!</div>
{/if}

<form method="POST" action="?/update" use:enhance>
	<div class="form-group">
		<label for="name">Trip Name *</label>
		<input type="text" id="name" name="name" value={data.trip.name} required />
	</div>

	<div class="form-group">
		<label for="description">Description</label>
		<textarea id="description" name="description">{data.trip.description || ''}</textarea>
	</div>

	<div class="form-row">
		<div class="form-group">
			<label for="start_date">Start Date</label>
			<input type="date" id="start_date" name="start_date" value={data.trip.start_date || ''} />
		</div>
		<div class="form-group">
			<label for="end_date">End Date</label>
			<input type="date" id="end_date" name="end_date" value={data.trip.end_date || ''} />
		</div>
	</div>

	<div class="form-row">
		<div class="form-group">
			<label for="total_budget">Budget</label>
			<input type="number" id="total_budget" name="total_budget" step="0.01" value={data.trip.total_budget || ''} />
		</div>
		<div class="form-group">
			<label for="budget_currency">Currency</label>
			<select id="budget_currency" name="budget_currency">
				<option value="USD" selected={data.trip.budget_currency === 'USD'}>USD</option>
				<option value="EUR" selected={data.trip.budget_currency === 'EUR'}>EUR</option>
				<option value="GBP" selected={data.trip.budget_currency === 'GBP'}>GBP</option>
				<option value="JPY" selected={data.trip.budget_currency === 'JPY'}>JPY</option>
				<option value="AUD" selected={data.trip.budget_currency === 'AUD'}>AUD</option>
				<option value="CAD" selected={data.trip.budget_currency === 'CAD'}>CAD</option>
			</select>
		</div>
	</div>

	<div class="form-group">
		<label for="cover_image">Cover Image URL</label>
		<input type="url" id="cover_image" name="cover_image" value={data.trip.cover_image || ''} />
	</div>

	<div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
		<button type="submit" class="btn btn-primary">Save Changes</button>
	</div>
</form>

<form method="POST" action="?/delete" use:enhance style="margin-top: 1rem;">
	<button type="submit" class="btn btn-danger" onclick={(e) => {
		if (!confirm('Delete this trip? Posts will be unlinked.')) e.preventDefault();
	}}>Delete Trip</button>
</form>

{#if data.posts.length > 0}
	<div style="margin-top: 3rem;">
		<h2>Posts in this Trip ({data.posts.length})</h2>
		<div class="posts-list">
			{#each data.posts as post}
				<div class="post-item">
					<span class="post-status" class:published={post.status === 'published'}>{post.status}</span>
					<a href="/admin/posts/{post.id}">{post.title}</a>
					<span class="post-date">{new Date(post.created_at).toLocaleDateString()}</span>
				</div>
			{/each}
		</div>
	</div>
{/if}

<style>
	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.posts-list {
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.post-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.75rem 1rem;
		background: var(--card);
		border-radius: var(--radius);
	}

	.post-status {
		font-size: 0.75rem;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		background: var(--text-light);
		color: white;
	}

	.post-status.published {
		background: var(--success);
	}

	.post-item a {
		flex: 1;
		color: var(--text);
		text-decoration: none;
	}

	.post-item a:hover {
		color: var(--primary);
	}

	.post-date {
		color: var(--text-light);
		font-size: 0.875rem;
	}
</style>
