<script lang="ts">
	let { data } = $props();

	// Simple bar chart calculation
	let maxViews = $derived(Math.max(...data.analytics.viewsByDay.map((d: { count: number }) => d.count), 1));
</script>

<svelte:head>
	<title>Analytics - Admin</title>
</svelte:head>

<div class="page-header">
	<h1>📊 Analytics</h1>
	<p>Track your blog's performance</p>
</div>

<div class="time-filter">
	<a href="?days=7" class="btn btn-sm" class:btn-primary={data.days === 7} class:btn-outline={data.days !== 7}>7 days</a>
	<a href="?days=30" class="btn btn-sm" class:btn-primary={data.days === 30} class:btn-outline={data.days !== 30}>30 days</a>
	<a href="?days=90" class="btn btn-sm" class:btn-primary={data.days === 90} class:btn-outline={data.days !== 90}>90 days</a>
</div>

<div class="stats-grid">
	<div class="stat-card">
		<div class="stat-value">{data.analytics.totalViews.toLocaleString()}</div>
		<div class="stat-label">Page Views</div>
	</div>
	<div class="stat-card">
		<div class="stat-value">{data.analytics.uniqueVisitors.toLocaleString()}</div>
		<div class="stat-label">Unique Visitors</div>
	</div>
</div>

<div class="section">
	<h2>Views Over Time</h2>
	{#if data.analytics.viewsByDay.length > 0}
		<div class="chart">
			{#each data.analytics.viewsByDay as day}
				<div class="bar-container">
					<div class="bar" style="height: {(day.count / maxViews) * 100}%"></div>
					<span class="bar-label">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
					<span class="bar-value">{day.count}</span>
				</div>
			{/each}
		</div>
	{:else}
		<p class="empty-state">No data for this period yet.</p>
	{/if}
</div>

<div class="two-columns">
	<div class="section">
		<h2>Top Posts</h2>
		{#if data.analytics.topPosts.length > 0}
			<div class="ranking-list">
				{#each data.analytics.topPosts as post, i}
					<div class="ranking-item">
						<span class="rank">#{i + 1}</span>
						<a href="/post/{post.slug}" class="item-title">{post.title}</a>
						<span class="item-value">{post.views} views</span>
					</div>
				{/each}
			</div>
		{:else}
			<p class="empty-state">No post views yet.</p>
		{/if}
	</div>

	<div class="section">
		<h2>Top Referrers</h2>
		{#if data.analytics.topReferrers.length > 0}
			<div class="ranking-list">
				{#each data.analytics.topReferrers as ref, i}
					<div class="ranking-item">
						<span class="rank">#{i + 1}</span>
						<span class="item-title referrer">{ref.referrer}</span>
						<span class="item-value">{ref.count} visits</span>
					</div>
				{/each}
			</div>
		{:else}
			<p class="empty-state">No referrer data yet.</p>
		{/if}
	</div>
</div>

<style>
	.time-filter {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 2rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.stat-card {
		background: var(--card);
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

	.section {
		background: var(--card);
		padding: 1.5rem;
		border-radius: var(--radius);
		margin-bottom: 1.5rem;
	}

	.section h2 {
		margin: 0 0 1.5rem;
		font-size: 1.25rem;
	}

	.chart {
		display: flex;
		align-items: flex-end;
		gap: 4px;
		height: 200px;
		overflow-x: auto;
		padding-bottom: 60px;
	}

	.bar-container {
		flex: 1;
		min-width: 30px;
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
		height: 100%;
	}

	.bar {
		width: 100%;
		max-width: 40px;
		background: var(--primary);
		border-radius: 4px 4px 0 0;
		min-height: 4px;
		margin-top: auto;
	}

	.bar-label {
		position: absolute;
		bottom: -50px;
		font-size: 0.7rem;
		color: var(--text-light);
		transform: rotate(-45deg);
		white-space: nowrap;
	}

	.bar-value {
		position: absolute;
		bottom: -20px;
		font-size: 0.75rem;
		color: var(--text);
	}

	.two-columns {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: 1.5rem;
	}

	.ranking-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.ranking-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.75rem;
		background: var(--background);
		border-radius: var(--radius);
	}

	.rank {
		color: var(--text-light);
		font-weight: 600;
		width: 30px;
	}

	.item-title {
		flex: 1;
		color: var(--text);
		text-decoration: none;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.item-title:hover {
		color: var(--primary);
	}

	.item-title.referrer {
		font-size: 0.875rem;
	}

	.item-value {
		color: var(--text-light);
		font-size: 0.875rem;
		white-space: nowrap;
	}

	.empty-state {
		text-align: center;
		color: var(--text-light);
		padding: 2rem;
	}
</style>
