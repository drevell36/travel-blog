<script lang="ts">
	import { enhance } from '$app/forms';
	
	let { form } = $props();
</script>

<svelte:head>
	<title>Login - Travel Blog</title>
</svelte:head>

<div class="login-container">
	<div class="login-card">
		<h1>Welcome Back</h1>
		<p>Sign in to manage your travel blog</p>

		{#if form?.error}
			<div class="alert alert-error">{form.error}</div>
		{/if}

		<form method="POST" use:enhance>
			<div class="form-group">
				<label for="username">Username</label>
				<input type="text" id="username" name="username" required autocomplete="username" />
			</div>

			<div class="form-group">
				<label for="password">Password</label>
				<input type="password" id="password" name="password" required autocomplete="current-password" />
			</div>

			<button type="submit" class="btn btn-primary" style="width: 100%;">Sign In</button>
		</form>
	</div>
</div>

<style>
	.login-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 60vh;
	}

	.login-card {
		background: var(--surface);
		padding: 3rem;
		border-radius: var(--radius);
		box-shadow: var(--shadow-lg);
		width: 100%;
		max-width: 400px;
	}

	.login-card h1 {
		margin-bottom: 0.5rem;
	}

	.login-card > p {
		color: var(--text-light);
		margin-bottom: 2rem;
	}
</style>
