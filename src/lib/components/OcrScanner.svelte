<script lang="ts">
	let { onTextExtracted = (text: string) => {} } = $props();
	
	let isOpen = $state(false);
	let isProcessing = $state(false);
	let isCropping = $state(false);
	let progress = $state(0);
	let progressMessage = $state('');
	let previewUrl = $state('');
	let croppedUrl = $state('');
	let extractedText = $state('');
	let fileInput = $state<HTMLInputElement | null>(null);
	let imageElement = $state<HTMLImageElement | null>(null);
	let canvasRef = $state<HTMLCanvasElement | null>(null);
	let originalFile = $state<File | null>(null);
	
	// Crop selection state
	let cropStart = $state({ x: 0, y: 0 });
	let cropEnd = $state({ x: 0, y: 0 });
	let isDragging = $state(false);
	let hasCropSelection = $state(false);
	let imageOffset = $state({ x: 0, y: 0 });
	
	/**
	 * Convert ALL CAPS text to proper sentence case
	 */
	function toProperCase(text: string): string {
		const sentences = text.split(/([.!?]+\s*)/);
		
		return sentences.map((segment) => {
			if (/^[.!?]+\s*$/.test(segment)) {
				return segment;
			}
			
			let result = segment.toLowerCase();
			result = result.replace(/^\s*\w/, (match) => match.toUpperCase());
			result = result.replace(/\bi\b/g, 'I');
			
			const properNouns = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
				'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
			properNouns.forEach(noun => {
				const regex = new RegExp(`\\b${noun}\\b`, 'gi');
				result = result.replace(regex, noun.charAt(0).toUpperCase() + noun.slice(1));
			});
			
			return result;
		}).join('');
	}
	
	async function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		
		originalFile = file;
		previewUrl = URL.createObjectURL(file);
		croppedUrl = '';
		extractedText = '';
		isCropping = true;
		hasCropSelection = false;
		cropStart = { x: 0, y: 0 };
		cropEnd = { x: 0, y: 0 };
	}
	
	function handleMouseDown(event: MouseEvent) {
		if (!isCropping || !imageElement) return;
		
		const imgRect = imageElement.getBoundingClientRect();
		const containerRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		
		// Calculate image offset within container (for centered images)
		imageOffset = {
			x: imgRect.left - containerRect.left,
			y: imgRect.top - containerRect.top
		};
		
		cropStart = {
			x: event.clientX - imgRect.left,
			y: event.clientY - imgRect.top
		};
		cropEnd = { ...cropStart };
		isDragging = true;
		hasCropSelection = false;
	}
	
	function handleMouseMove(event: MouseEvent) {
		if (!isDragging || !imageElement) return;
		
		const rect = imageElement.getBoundingClientRect();
		cropEnd = {
			x: Math.max(0, Math.min(event.clientX - rect.left, rect.width)),
			y: Math.max(0, Math.min(event.clientY - rect.top, rect.height))
		};
	}
	
	function handleMouseUp() {
		if (!isDragging) return;
		isDragging = false;
		
		const width = Math.abs(cropEnd.x - cropStart.x);
		const height = Math.abs(cropEnd.y - cropStart.y);
		
		if (width > 20 && height > 20) {
			hasCropSelection = true;
		}
	}
	
	function getCropRect() {
		return {
			x: Math.min(cropStart.x, cropEnd.x),
			y: Math.min(cropStart.y, cropEnd.y),
			width: Math.abs(cropEnd.x - cropStart.x),
			height: Math.abs(cropEnd.y - cropStart.y)
		};
	}
	
	async function applyCrop() {
		if (!imageElement || !canvasRef || !hasCropSelection) return;
		
		const rect = getCropRect();
		const displayedWidth = imageElement.clientWidth;
		const displayedHeight = imageElement.clientHeight;
		const naturalWidth = imageElement.naturalWidth;
		const naturalHeight = imageElement.naturalHeight;
		
		// Scale crop coordinates to actual image size
		const scaleX = naturalWidth / displayedWidth;
		const scaleY = naturalHeight / displayedHeight;
		
		const cropX = rect.x * scaleX;
		const cropY = rect.y * scaleY;
		const cropW = rect.width * scaleX;
		const cropH = rect.height * scaleY;
		
		// Draw cropped area to canvas
		canvasRef.width = cropW;
		canvasRef.height = cropH;
		const ctx = canvasRef.getContext('2d');
		if (!ctx) return;
		
		ctx.drawImage(imageElement, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
		
		// Convert canvas to blob and process
		canvasRef.toBlob(async (blob) => {
			if (!blob) return;
			
			croppedUrl = URL.createObjectURL(blob);
			isCropping = false;
			
			const croppedFile = new File([blob], 'cropped.png', { type: 'image/png' });
			await processImage(croppedFile);
		}, 'image/png');
	}
	
	function skipCrop() {
		if (!originalFile) return;
		isCropping = false;
		processImage(originalFile);
	}
	
	async function processImage(file: File) {
		try {
			isProcessing = true;
			progress = 10;
			progressMessage = 'Sending to AI...';
			
			const result = await processWithServer(file);
			
			extractedText = toProperCase(result.text.trim());
			progress = 100;
			progressMessage = 'Done!';
		} catch (error) {
			console.error('OCR Error:', error);
			progressMessage = `Error: ${error instanceof Error ? error.message : String(error)}`;
			extractedText = '';
		} finally {
			isProcessing = false;
		}
	}
	
	async function processWithServer(file: File): Promise<{ text: string }> {
		const formData = new FormData();
		formData.append('image', file);
		
		progress = 30;
		
		const response = await fetch('/api/ocr', {
			method: 'POST',
			body: formData
		});
		
		if (!response.ok) {
			const errorData = await response.json().catch(() => ({})) as { message?: string };
			const message = errorData.message || `Server error: ${response.status}`;
			// Check for common local dev issues
			if (response.status === 503) {
				throw new Error('OCR not available locally. Deploy to Cloudflare to use OCR.');
			}
			throw new Error(message);
		}
		
		progress = 80;
		progressMessage = 'Reading results...';
		
		const data = await response.json() as { text?: string };
		if (!data.text) {
			throw new Error('No text detected in image');
		}
		return { text: data.text };
	}
	
	function insertText() {
		if (extractedText) {
			onTextExtracted(extractedText);
			closeModal();
		}
	}
	
	function closeModal() {
		isOpen = false;
		previewUrl = '';
		croppedUrl = '';
		extractedText = '';
		progress = 0;
		progressMessage = '';
		isCropping = false;
		hasCropSelection = false;
		originalFile = null;
		if (fileInput) fileInput.value = '';
	}
	
	function openModal() {
		isOpen = true;
	}
	
	function resetCrop() {
		hasCropSelection = false;
		cropStart = { x: 0, y: 0 };
		cropEnd = { x: 0, y: 0 };
	}
</script>

<button type="button" class="btn btn-outline ocr-trigger" onclick={openModal}>
	📷 Scan Text (OCR)
</button>

<!-- Hidden canvas for cropping -->
<canvas bind:this={canvasRef} style="display: none;"></canvas>

{#if isOpen}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div class="modal-backdrop" onclick={closeModal}></div>
	<div class="modal">
		<div class="modal-header">
			<h2>📷 Scan Text</h2>
			<button type="button" class="close-btn" onclick={closeModal}>×</button>
		</div>
		
		<div class="modal-body">
			{#if !previewUrl}
				<p class="hint">Upload a photo of text. You can crop to select just the text area for better accuracy.</p>
				
				<div class="upload-area">
					<input 
						type="file" 
						accept="image/*" 
						capture="environment"
						onchange={handleFileSelect}
						bind:this={fileInput}
						id="ocr-file"
					/>
					<label for="ocr-file" class="upload-label">
						<span class="upload-icon">📷</span>
						<span>Click to upload or take photo</span>
					</label>
				</div>
			{:else if isCropping}
				<p class="hint">✂️ <strong>Drag to select the text area</strong> - this improves accuracy. Or skip to scan the whole image.</p>
				
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div 
					class="crop-container"
					onmousedown={handleMouseDown}
					onmousemove={handleMouseMove}
					onmouseup={handleMouseUp}
					onmouseleave={handleMouseUp}
				>
					<img 
						src={previewUrl} 
						alt="Preview" 
						class="crop-image"
						bind:this={imageElement}
						draggable="false"
					/>
					{#if (isDragging || hasCropSelection)}
						{@const rect = getCropRect()}
						<div 
							class="crop-overlay"
							style="
								left: {rect.x + imageOffset.x}px;
								top: {rect.y + imageOffset.y}px;
								width: {rect.width}px;
								height: {rect.height}px;
							"
						></div>
					{/if}
				</div>
				
				<div class="crop-actions">
					{#if hasCropSelection}
						<button type="button" class="btn btn-outline btn-sm" onclick={resetCrop}>Reset Selection</button>
						<button type="button" class="btn btn-primary" onclick={applyCrop}>✂️ Crop & Scan</button>
					{:else}
						<button type="button" class="btn btn-outline" onclick={skipCrop}>Skip - Scan Whole Image</button>
					{/if}
				</div>
			{:else}
				{#if croppedUrl}
					<p class="hint">Cropped area:</p>
					<img src={croppedUrl} alt="Cropped" class="result-image" />
				{:else if previewUrl}
					<img src={previewUrl} alt="Preview" class="result-image" />
				{/if}
				
				{#if isProcessing}
					<div class="progress-section">
						<div class="progress-bar">
							<div class="progress-fill" style="width: {progress}%"></div>
						</div>
						<p class="progress-text">{progressMessage || 'Processing...'}</p>
					</div>
				{/if}
				
				{#if extractedText}
					<div class="result-section">
						<label for="extracted-text">Extracted Text (editable)</label>
						<textarea 
							id="extracted-text" 
							bind:value={extractedText}
							rows="8"
						></textarea>
					</div>
				{/if}
			{/if}
		</div>
		
		<div class="modal-footer">
			<button type="button" class="btn btn-outline" onclick={closeModal}>Cancel</button>
			{#if extractedText}
				<button type="button" class="btn btn-primary" onclick={insertText}>
					Insert Text
				</button>
			{/if}
		</div>
	</div>
{/if}

<style>
	.ocr-trigger {
		margin-bottom: 0.5rem;
	}
	
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.6);
		z-index: 1000;
	}
	
	.modal {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: var(--card, #fff);
		border-radius: 12px;
		width: 90%;
		max-width: 700px;
		max-height: 90vh;
		overflow-y: auto;
		z-index: 1001;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
		color: var(--text, #333);
	}
	
	:global(.dark) .modal {
		background: #1e293b;
		color: #f1f5f9;
		border: 1px solid #475569;
	}
	
	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--border, #ddd);
	}
	
	.modal-header h2 {
		margin: 0;
		font-size: 1.25rem;
	}
	
	.close-btn {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: var(--text-muted, #666);
		padding: 0.25rem;
		line-height: 1;
	}
	
	.close-btn:hover {
		color: var(--text, #333);
	}
	
	.modal-body {
		padding: 1.5rem;
	}
	
	.hint {
		color: var(--text-muted, #666);
		font-size: 0.875rem;
		margin-bottom: 1rem;
	}
	
	:global(.dark) .hint {
		color: #94a3b8;
	}
	
	.upload-area {
		position: relative;
		margin-bottom: 1rem;
	}
	
	.upload-area input[type="file"] {
		position: absolute;
		opacity: 0;
		width: 100%;
		height: 100%;
		cursor: pointer;
	}
	
	.upload-label {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 200px;
		border: 2px dashed var(--border, #ddd);
		border-radius: 8px;
		cursor: pointer;
		transition: border-color 0.2s, background 0.2s;
		overflow: hidden;
	}
	
	.upload-label:hover {
		border-color: var(--primary, #3b82f6);
		background: rgba(59, 130, 246, 0.05);
	}
	
	.upload-icon {
		font-size: 3rem;
		margin-bottom: 0.5rem;
	}
	
	/* Crop styles */
	.crop-container {
		position: relative;
		cursor: crosshair;
		user-select: none;
		border: 2px solid var(--border, #ddd);
		border-radius: 8px;
		overflow: hidden;
		margin-bottom: 1rem;
	}
	
	.crop-image {
		display: block;
		max-width: 100%;
		max-height: 400px;
		margin: 0 auto;
	}
	
	.crop-overlay {
		position: absolute;
		border: 3px dashed var(--primary, #3b82f6);
		background: rgba(59, 130, 246, 0.15);
		pointer-events: none;
	}
	
	.crop-actions {
		display: flex;
		justify-content: center;
		gap: 1rem;
		margin-top: 1rem;
	}
	
	.result-image {
		max-width: 100%;
		max-height: 200px;
		object-fit: contain;
		border-radius: 8px;
		margin-bottom: 1rem;
	}
	
	.progress-section {
		margin: 1rem 0;
		padding: 1rem;
		background: var(--card, #f9f9f9);
		border: 1px solid var(--border, #ddd);
		border-radius: 8px;
	}
	
	:global(.dark) .progress-section {
		background: #0f172a;
		border-color: #475569;
	}
	
	.progress-bar {
		height: 12px;
		background: var(--border, #ddd);
		border-radius: 6px;
		overflow: hidden;
	}
	
	.progress-fill {
		height: 100%;
		background: var(--primary, #3b82f6);
		transition: width 0.3s;
		min-width: 5%;
	}
	
	.progress-text {
		text-align: center;
		font-size: 0.875rem;
		color: var(--text-muted, #666);
		margin-top: 0.5rem;
	}
	
	:global(.dark) .progress-text {
		color: #94a3b8;
	}
	
	.result-section {
		margin-top: 1rem;
	}
	
	.result-section label {
		display: block;
		font-weight: 500;
		margin-bottom: 0.5rem;
		color: var(--text, #333);
	}
	
	.result-section textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--border, #ddd);
		border-radius: 6px;
		font-family: inherit;
		font-size: 0.9rem;
		line-height: 1.5;
		resize: vertical;
		background: var(--input-bg, var(--card, #fff));
		color: var(--text, #333);
	}
	
	:global(.dark) .result-section textarea {
		background: #1e293b;
		color: #f1f5f9;
		border-color: #475569;
	}
	
	:global(.dark) .result-section label {
		color: #f1f5f9;
	}
	
	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		padding: 1rem 1.5rem;
		border-top: 1px solid var(--border, #ddd);
	}
	
	.btn-sm {
		padding: 0.375rem 0.75rem;
		font-size: 0.875rem;
	}
</style>
