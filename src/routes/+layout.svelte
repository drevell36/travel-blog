<script lang="ts">
	import '../app.css';
	import { browser } from '$app/environment';
	import { escapeHtml } from '$lib/utils/sanitize';
	
	let { data, children } = $props();
	
	let darkMode = $state(false);
	let searchQuery = $state('');
	let searchResults = $state<Array<{id: string, title: string, slug: string, excerpt: string | null}>>([]);
	let isSearching = $state(false);
	let showResults = $state(false);
	
	// Get settings with defaults using $derived for reactivity
	const siteName = $derived((data as any).settings?.site_name || '🌍 Travel Blog');
	const siteLogo = $derived((data as any).settings?.site_logo || '');
	const footerText = $derived((data as any).settings?.footer_text || '© {year} Travel Blog. All adventures reserved.');
	const primaryColor = $derived((data as any).settings?.primary_color || '#e67e22');
	const defaultTheme = $derived((data as any).settings?.default_theme || 'system');
	
	// Initialize from localStorage on mount
	$effect(() => {
		if (browser) {
			// Apply primary color as CSS variable
			document.documentElement.style.setProperty('--color-primary', primaryColor);
			
			const saved = localStorage.getItem('theme');
			if (saved) {
				darkMode = saved === 'dark';
			} else if (defaultTheme === 'system') {
				darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
			} else {
				darkMode = defaultTheme === 'dark';
			}
			document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
		}
	});
	
	function toggleDarkMode() {
		darkMode = !darkMode;
		const theme = darkMode ? 'dark' : 'light';
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('theme', theme);
	}

	async function handleSearch(e: Event) {
		e.preventDefault();
		if (!searchQuery.trim()) return;
		
		isSearching = true;
		showResults = true;
		
		try {
			const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
			if (res.ok) {
				searchResults = await res.json();
			}
		} catch (err) {
			console.error('Search failed:', err);
		} finally {
			isSearching = false;
		}
	}

	function closeSearch() {
		showResults = false;
		searchResults = [];
	}
</script>

<svelte:window onclick={(e) => {
	const target = e.target as HTMLElement;
	if (!target.closest('.nav-search-wrapper')) {
		closeSearch();
	}
}} />

<div class="app">
	<header>
		<nav>
			<a href="/" class="logo">
				{#if siteLogo}
					<img src={siteLogo} alt={siteName} class="site-logo" />
				{:else}
					{siteName}
				{/if}
			</a>
			<div class="nav-links">
				<a href="/">Home</a>
				<a href="/posts">Posts</a>
				<a href="/photos">Photos</a>
				<a href="/trips">Trips</a>
				<div class="nav-search-wrapper">
					<form onsubmit={handleSearch} class="nav-search">
						<input 
							type="text" 
							bind:value={searchQuery} 
							placeholder="Search..." 
							class="nav-search-input" 
							onfocus={() => searchResults.length > 0 && (showResults = true)}
						/>
						<button type="submit" class="nav-search-btn">🔍</button>
					</form>
					{#if showResults}
						<div class="search-dropdown">
							{#if isSearching}
								<div class="search-loading">Searching...</div>
							{:else if searchResults.length > 0}
								{#each searchResults as result}
									<a href="/post/{result.slug}" class="search-result" onclick={closeSearch}>
										<span class="result-title">{result.title}</span>
										{#if result.excerpt}
											<span class="result-excerpt">{result.excerpt.slice(0, 60)}...</span>
										{/if}
									</a>
								{/each}
							{:else if searchQuery}
								<div class="search-empty">No results for "{searchQuery}"</div>
							{/if}
						</div>
					{/if}
				</div>
				{#if data.user}
					<a href="/admin">Dashboard</a>
					<form method="POST" action="/logout" style="display: inline;">
						<button type="submit" class="logout-btn">Logout</button>
					</form>
				{:else}
					<a href="/login" class="login-btn">Login</a>
				{/if}
				<button class="theme-toggle" onclick={toggleDarkMode} aria-label="Toggle dark mode">
					{#if darkMode}
						☀️
					{:else}
						🌙
					{/if}
				</button>
			</div>
		</nav>
	</header>

	<main>
		{@render children()}
	</main>

	<footer>
		<p>{@html escapeHtml(footerText).replace('{year}', new Date().getFullYear().toString())}</p>
	</footer>
</div>

<style>
	.nav-search-wrapper {
		position: relative;
	}

	.nav-search {
		display: flex;
		align-items: center;
		gap: 0;
	}

	.nav-search-input {
		padding: 0.4rem 0.75rem;
		border: 1px solid var(--border);
		border-radius: var(--radius) 0 0 var(--radius);
		background: var(--background);
		color: var(--text);
		font-size: 0.875rem;
		width: 150px;
		transition: width 0.2s, border-color 0.2s;
	}

	.nav-search-input:focus {
		outline: none;
		border-color: var(--primary);
		width: 200px;
	}

	.nav-search-btn {
		padding: 0.4rem 0.6rem;
		border: 1px solid var(--border);
		border-left: none;
		border-radius: 0 var(--radius) var(--radius) 0;
		background: var(--surface);
		cursor: pointer;
		font-size: 0.875rem;
	}

	.nav-search-btn:hover {
		background: var(--primary);
	}

	.search-dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		margin-top: 0.25rem;
		box-shadow: 0 4px 12px rgba(0,0,0,0.15);
		z-index: 100;
		max-height: 300px;
		overflow-y: auto;
		min-width: 250px;
	}

	.search-loading, .search-empty {
		padding: 1rem;
		color: var(--text-muted);
		font-size: 0.875rem;
		text-align: center;
	}

	.search-result {
		display: flex;
		flex-direction: column;
		padding: 0.75rem 1rem;
		text-decoration: none;
		color: var(--text);
		border-bottom: 1px solid var(--border);
		transition: background 0.15s;
	}

	.search-result:last-child {
		border-bottom: none;
	}

	.search-result:hover {
		background: var(--background);
	}

	.result-title {
		font-weight: 500;
		font-size: 0.9rem;
	}

	.result-excerpt {
		font-size: 0.8rem;
		color: var(--text-muted);
		margin-top: 0.25rem;
	}

	@media (max-width: 768px) {
		.nav-search-input {
			width: 100px;
		}

		.nav-search-input:focus {
			width: 140px;
		}

		.search-dropdown {
			min-width: 200px;
		}
	}

	.site-logo {
		height: 32px;
		width: auto;
		object-fit: contain;
	}
</style>
