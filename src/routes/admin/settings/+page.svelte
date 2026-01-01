<script lang="ts">
	import { enhance } from '$app/forms';
	
	let { data, form } = $props();
	let exportData = $state('');
	
	function downloadBackup() {
		if (!exportData) return;
		const blob = new Blob([exportData], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `blog-backup-${new Date().toISOString().split('T')[0]}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}
	
	$effect(() => {
		if (form?.exportData) {
			exportData = form.exportData;
			downloadBackup();
		}
	});
</script>

<svelte:head>
	<title>Settings - Admin</title>
</svelte:head>

<div class="page-header">
	<h1>⚙️ Settings</h1>
	<p>Manage your site configuration</p>
</div>

{#if form?.error}
	<div class="alert alert-error">{form.error}</div>
{/if}

{#if form?.settingsSuccess}
	<div class="alert alert-success">Settings saved successfully!</div>
{/if}

{#if form?.passwordSuccess}
	<div class="alert alert-success">Password changed successfully!</div>
{/if}

<div class="settings-grid">
	<!-- Site Configuration -->
	<div class="settings-section">
		<h2>🌐 Site Configuration</h2>
		<form method="POST" action="?/updateSettings" use:enhance>
			<div class="form-group">
				<label for="site_name">Site Name</label>
				<input type="text" id="site_name" name="site_name" value={data.settings.site_name} />
			</div>

			<div class="form-group">
				<label for="site_description">Site Description</label>
				<textarea id="site_description" name="site_description" rows="2">{data.settings.site_description}</textarea>
			</div>

			<div class="form-group">
				<label for="site_logo">Logo URL</label>
				<input type="url" id="site_logo" name="site_logo" value={data.settings.site_logo} placeholder="https://example.com/logo.png" />
			</div>

			<div class="form-group">
				<label for="footer_text">Footer Text</label>
				<input type="text" id="footer_text" name="footer_text" value={data.settings.footer_text} />
				<small>Use {'{year}'} for current year</small>
			</div>

			<h3>🎨 Appearance</h3>

			<div class="form-group">
				<label for="primary_color">Primary Color</label>
				<div class="color-input">
					<input type="color" id="primary_color" name="primary_color" value={data.settings.primary_color} />
					<input type="text" value={data.settings.primary_color} disabled />
				</div>
			</div>

			<div class="form-group">
				<label for="default_theme">Default Theme</label>
				<select id="default_theme" name="default_theme">
					<option value="system" selected={data.settings.default_theme === 'system'}>System</option>
					<option value="light" selected={data.settings.default_theme === 'light'}>Light</option>
					<option value="dark" selected={data.settings.default_theme === 'dark'}>Dark</option>
				</select>
			</div>

			<h3>💬 Features</h3>

			<div class="form-group checkbox-group">
				<label>
					<input type="checkbox" name="comments_enabled" checked={data.settings.comments_enabled} />
					Enable Comments
				</label>
			</div>

			<div class="form-group checkbox-group">
				<label>
					<input type="checkbox" name="reactions_enabled" checked={data.settings.reactions_enabled} />
					Enable Reactions
				</label>
			</div>

			<div class="form-group">
				<label for="notification_email">Notification Email</label>
				<input type="email" id="notification_email" name="notification_email" value={data.settings.notification_email} placeholder="admin@example.com" />
				<small>Receive notifications for new comments</small>
			</div>

			<button type="submit" class="btn btn-primary">💾 Save Settings</button>
		</form>
	</div>

	<!-- Account & Security -->
	<div class="settings-section">
		<h2>🔐 Change Password</h2>
		<form method="POST" action="?/changePassword" use:enhance>
			<div class="form-group">
				<label for="currentPassword">Current Password</label>
				<input type="password" id="currentPassword" name="currentPassword" required autocomplete="current-password" />
			</div>

			<div class="form-group">
				<label for="newPassword">New Password</label>
				<input type="password" id="newPassword" name="newPassword" required minlength="8" autocomplete="new-password" />
			</div>

			<div class="form-group">
				<label for="confirmPassword">Confirm New Password</label>
				<input type="password" id="confirmPassword" name="confirmPassword" required minlength="8" autocomplete="new-password" />
			</div>

			<button type="submit" class="btn btn-primary">🔑 Change Password</button>
		</form>
	</div>

	<!-- Backup & Export -->
	<div class="settings-section">
		<h2>💾 Backup & Export</h2>
		<p>Download all your blog data including posts, photos, tags, trips, and settings.</p>
		<form method="POST" action="?/exportData" use:enhance>
			<button type="submit" class="btn btn-outline">📥 Download Backup (JSON)</button>
		</form>
	</div>
</div>

<style>
	.settings-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
		gap: 2rem;
	}

	.settings-section {
		background: var(--card);
		padding: 1.5rem;
		border-radius: var(--radius);
		border: 1px solid var(--border);
	}

	.settings-section h2 {
		margin: 0 0 1.5rem;
		font-size: 1.1rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--border);
	}

	.settings-section h3 {
		margin: 1.5rem 0 1rem;
		font-size: 0.95rem;
		color: var(--text-muted);
	}

	.settings-section p {
		color: var(--text-muted);
		margin-bottom: 1rem;
		font-size: 0.9rem;
	}

	.color-input {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.color-input input[type="color"] {
		width: 50px;
		height: 38px;
		padding: 0;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		cursor: pointer;
	}

	.color-input input[type="text"] {
		width: 100px;
		font-family: monospace;
	}

	.checkbox-group label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	.checkbox-group input[type="checkbox"] {
		width: 18px;
		height: 18px;
	}

	small {
		display: block;
		color: var(--text-muted);
		font-size: 0.8rem;
		margin-top: 0.25rem;
	}

	@media (max-width: 500px) {
		.settings-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
