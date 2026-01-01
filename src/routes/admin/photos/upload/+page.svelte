<script lang="ts">
	import { enhance } from '$app/forms';
	
	let { form } = $props();
	let files = $state<FileList | null>(null);
	let previews = $state<string[]>([]);
	let optimizedFiles = $state<File[]>([]);
	let isOptimizing = $state(false);
	let maxWidth = $state(1920);
	let quality = $state(0.8);

	async function optimizeImage(file: File): Promise<File> {
		return new Promise((resolve) => {
			const img = new Image();
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d')!;

			img.onload = () => {
				let { width, height } = img;
				
				// Scale down if wider than maxWidth
				if (width > maxWidth) {
					height = (height * maxWidth) / width;
					width = maxWidth;
				}

				canvas.width = width;
				canvas.height = height;
				ctx.drawImage(img, 0, 0, width, height);

				canvas.toBlob(
					(blob) => {
						if (blob) {
							const optimizedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
								type: 'image/jpeg',
								lastModified: Date.now()
							});
							resolve(optimizedFile);
						} else {
							resolve(file);
						}
					},
					'image/jpeg',
					quality
				);
			};

			img.src = URL.createObjectURL(file);
		});
	}

	async function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		files = input.files;
		previews = [];
		optimizedFiles = [];
		
		if (files && files.length > 0) {
			isOptimizing = true;
			
			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				
				// Optimize image
				const optimized = await optimizeImage(file);
				optimizedFiles = [...optimizedFiles, optimized];
				
				// Generate preview from optimized
				const reader = new FileReader();
				reader.onload = (e) => {
					previews = [...previews, e.target?.result as string];
				};
				reader.readAsDataURL(optimized);
			}
			
			isOptimizing = false;
		}
	}

	function formatBytes(bytes: number): string {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
	}

	function handleSubmit() {
		// Replace form data with optimized files
		const input = document.getElementById('photos') as HTMLInputElement;
		const dt = new DataTransfer();
		optimizedFiles.forEach(f => dt.items.add(f));
		input.files = dt.files;
	}
</script>

<svelte:head>
	<title>Upload Photos - Admin</title>
</svelte:head>

<div class="page-header">
	<h1>Upload Photos</h1>
	<p>Add new photos to your gallery (auto-optimized)</p>
</div>

{#if form?.error}
	<div class="alert alert-error">{form.error}</div>
{/if}

<form method="POST" enctype="multipart/form-data" use:enhance onsubmit={handleSubmit}>
	<div class="optimization-settings">
		<h4>🖼️ Optimization Settings</h4>
		<div class="settings-row">
			<div class="form-group">
				<label for="maxWidth">Max Width</label>
				<select id="maxWidth" bind:value={maxWidth}>
					<option value={1280}>1280px (Web)</option>
					<option value={1920}>1920px (Full HD)</option>
					<option value={2560}>2560px (2K)</option>
					<option value={99999}>Original</option>
				</select>
			</div>
			<div class="form-group">
				<label for="quality">Quality</label>
				<select id="quality" bind:value={quality}>
					<option value={0.6}>Low (60%)</option>
					<option value={0.8}>Good (80%)</option>
					<option value={0.9}>High (90%)</option>
					<option value={1}>Max (100%)</option>
				</select>
			</div>
		</div>
	</div>

	<div class="form-group">
		<label for="photos" class="file-upload">
			<input type="file" id="photos" name="photos" accept="image/*" multiple onchange={handleFileSelect} />
			<div>
				<p style="font-size: 2rem;">📷</p>
				<p><strong>Click to upload</strong> or drag and drop</p>
				<p style="color: var(--text-light); font-size: 0.875rem;">Images will be auto-resized and compressed</p>
			</div>
		</label>
	</div>

	{#if isOptimizing}
		<div class="optimizing">⏳ Optimizing images...</div>
	{/if}

	{#if previews.length > 0}
		<div class="previews">
			{#each previews as preview, i}
				<div class="preview-item">
					<img src={preview} alt="Preview {i + 1}" class="preview-image" />
					{#if optimizedFiles[i]}
						<span class="file-size">{formatBytes(optimizedFiles[i].size)}</span>
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	<div class="form-group">
		<label for="location">Location (applies to all photos)</label>
		<input type="text" id="location" name="location" placeholder="Paris, France" />
	</div>

	<div style="display: flex; gap: 1rem;">
		<button type="submit" class="btn btn-primary" disabled={!optimizedFiles.length || isOptimizing}>
			{isOptimizing ? 'Optimizing...' : 'Upload Photos'}
		</button>
		<a href="/admin/photos" class="btn btn-outline">Cancel</a>
	</div>
</form>

<style>
	.optimization-settings {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 1rem;
		margin-bottom: 1.5rem;
	}

	.optimization-settings h4 {
		margin: 0 0 0.75rem;
		font-size: 0.9rem;
	}

	.settings-row {
		display: flex;
		gap: 1rem;
	}

	.settings-row .form-group {
		flex: 1;
		margin: 0;
	}

	.optimizing {
		text-align: center;
		padding: 1rem;
		color: var(--primary);
		font-weight: 500;
	}

	.previews {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.preview-item {
		position: relative;
	}

	.preview-image {
		width: 150px;
		height: 150px;
		object-fit: cover;
		border-radius: var(--radius);
	}

	.file-size {
		position: absolute;
		bottom: 0.5rem;
		left: 0.5rem;
		background: rgba(0,0,0,0.7);
		color: white;
		padding: 0.125rem 0.5rem;
		border-radius: 0.25rem;
		font-size: 0.75rem;
	}
</style>
