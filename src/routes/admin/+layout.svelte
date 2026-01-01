<script lang="ts">
	import { page } from '$app/state';
	
	let { children } = $props();
</script>

<div class="admin-layout">
	<aside class="admin-sidebar">
		<h3>Admin Panel</h3>
		<nav class="admin-nav">
			<a href="/admin" class:active={page.url.pathname === '/admin'}>📊 Dashboard</a>
			<a href="/admin/posts" class:active={page.url.pathname.startsWith('/admin/posts')}>📝 Posts</a>
			<a href="/admin/photos" class:active={page.url.pathname.startsWith('/admin/photos')}>📷 Photos</a>
			<a href="/admin/trips" class:active={page.url.pathname.startsWith('/admin/trips')}>🧳 Trips</a>
			<a href="/admin/tags" class:active={page.url.pathname.startsWith('/admin/tags')}>🏷️ Tags</a>
			<a href="/admin/comments" class:active={page.url.pathname.startsWith('/admin/comments')}>💬 Comments</a>
			<a href="/admin/analytics" class:active={page.url.pathname.startsWith('/admin/analytics')}>📈 Analytics</a>
			<a href="/admin/settings" class:active={page.url.pathname.startsWith('/admin/settings')}>⚙️ Settings</a>
		</nav>
	</aside>
	<div class="admin-content">
		{@render children()}
	</div>
</div>
