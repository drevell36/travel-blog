<script lang="ts">
	import { enhance } from '$app/forms';
	
	let { data, form } = $props();
</script>

<svelte:head>
	<title>Edit Photo - Admin</title>
</svelte:head>

<div class="page-header">
	<h1>Edit Photo</h1>
	<p>Update photo details</p>
</div>

{#if form?.error}
	<div class="alert alert-error">{form.error}</div>
{/if}

{#if form?.success}
	<div class="alert alert-success">Photo updated successfully!</div>
{/if}

<div style="display: grid; grid-template-columns: 300px 1fr; gap: 2rem;">
	<div>
		<img src="/photos/{data.photo.filename}" alt={data.photo.caption || 'Photo'} style="width: 100%; border-radius: var(--radius);" />
	</div>

	<form method="POST" action="?/update" use:enhance>
		<div class="form-group">
			<label for="caption">Caption</label>
			<input type="text" id="caption" name="caption" value={data.photo.caption || ''} placeholder="A beautiful sunset..." />
		</div>

		<div class="form-group">
			<label for="location">Location</label>
			<input type="text" id="location" name="location" value={data.photo.location || ''} placeholder="Paris, France" />
		</div>

		<div class="form-group">
			<label for="post_id">Link to Post</label>
			<select id="post_id" name="post_id">
				<option value="">-- No post --</option>
				{#each data.posts as post}
					<option value={post.id} selected={data.photo.post_id === post.id}>{post.title}</option>
				{/each}
			</select>
		</div>

		<div style="display: flex; gap: 1rem;">
			<button type="submit" class="btn btn-primary">Save Changes</button>
			<a href="/admin/photos" class="btn btn-outline">Cancel</a>
		</div>
	</form>
</div>
