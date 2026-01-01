<script lang="ts">
	import { enhance } from '$app/forms';
	
	let { data, form } = $props();
	let showForm = $state(false);
</script>

<svelte:head>
	<title>Trips - Admin</title>
</svelte:head>

<div class="page-header">
	<h1>🧳 Trips</h1>
	<p>Group your posts by journey</p>
</div>

{#if form?.error}
	<div class="alert alert-error">{form.error}</div>
{/if}

{#if form?.success}
	<div class="alert alert-success">Trip saved successfully!</div>
{/if}

<button class="btn btn-primary" onclick={() => showForm = !showForm} style="margin-bottom: 1.5rem;">
	{showForm ? '✕ Cancel' : '➕ New Trip'}
</button>

{#if showForm}
	<div class="card create-card" style="margin-bottom: 2rem;">
		<h3>Create New Trip</h3>
		<form method="POST" action="?/create" use:enhance>
			<div class="form-group">
				<label for="name">Trip Name *</label>
				<input type="text" id="name" name="name" placeholder="Southeast Asia 2025" required />
			</div>

			<div class="form-group">
				<label for="description">Description</label>
				<textarea id="description" name="description" placeholder="A three-month journey through..."></textarea>
			</div>

			<div class="form-row">
				<div class="form-group">
					<label for="start_date">Start Date</label>
					<input type="date" id="start_date" name="start_date" />
				</div>
				<div class="form-group">
					<label for="end_date">End Date</label>
					<input type="date" id="end_date" name="end_date" />
				</div>
			</div>

			<div class="form-group">
				<label for="cover_image">Cover Image URL</label>
				<input type="url" id="cover_image" name="cover_image" placeholder="https://..." />
			</div>

			<button type="submit" class="btn btn-primary">Create Trip</button>
		</form>
	</div>
{/if}

<!-- Trips list -->
<div class="trips-grid">
	{#each data.trips as trip}
		<div class="trip-card">
			{#if trip.cover_image}
				<div class="trip-cover" style="background-image: url({trip.cover_image})"></div>
			{/if}
			<div class="trip-content">
				<h3>{trip.name}</h3>
				{#if trip.description}
					<p class="trip-description">{trip.description}</p>
				{/if}
				<div class="trip-meta">
					{#if trip.start_date}
						<span>📅 {trip.start_date}{trip.end_date ? ` - ${trip.end_date}` : ''}</span>
					{/if}
					{#if trip.total_budget}
						<span>💰 {trip.total_budget} {trip.budget_currency}</span>
					{/if}
				</div>
				<div class="trip-actions">
					<a href="/admin/trips/{trip.id}" class="btn btn-sm btn-outline">Edit</a>
					<a href="/trip/{trip.slug}" class="btn btn-sm btn-outline" target="_blank">View</a>
					<form method="POST" action="?/delete" use:enhance style="display: inline;">
						<input type="hidden" name="id" value={trip.id} />
						<button type="submit" class="btn btn-sm btn-danger" onclick={(e) => {
							if (!confirm('Delete this trip? Posts will be unlinked.')) e.preventDefault();
						}}>Delete</button>
					</form>
				</div>
			</div>
		</div>
	{:else}
		<p class="empty-state">No trips yet. Create your first trip to organize your posts!</p>
	{/each}
</div>

<style>
	.create-card {
		padding: 1.5rem;
	}

	.create-card h3 {
		margin: 0 0 1.5rem;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.trips-grid {
		display: grid;
		gap: 1.5rem;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
	}

	.trip-card {
		background: var(--card);
		border-radius: var(--radius);
		overflow: hidden;
	}

	.trip-cover {
		height: 150px;
		background-size: cover;
		background-position: center;
	}

	.trip-content {
		padding: 1.5rem;
	}

	.trip-content h3 {
		margin: 0 0 0.5rem;
	}

	.trip-description {
		color: var(--text-light);
		font-size: 0.875rem;
		margin-bottom: 1rem;
	}

	.trip-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		font-size: 0.875rem;
		color: var(--text-light);
		margin-bottom: 1rem;
	}

	.trip-actions {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.empty-state {
		grid-column: 1 / -1;
		text-align: center;
		color: var(--text-light);
		padding: 2rem;
	}
</style>
