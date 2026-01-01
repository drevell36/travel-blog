<script lang="ts">
	let { value = $bindable(''), id = 'editor', name = 'content' } = $props();
	
	let showPreview = $state(false);
	
	// Simple markdown to HTML conversion for preview
	function parseMarkdown(text: string): string {
		if (!text) return '';
		
		let html = text
			// Escape HTML first
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			// Headers
			.replace(/^### (.*$)/gim, '<h3>$1</h3>')
			.replace(/^## (.*$)/gim, '<h2>$1</h2>')
			.replace(/^# (.*$)/gim, '<h1>$1</h1>')
			// Bold and italic
			.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
			.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
			.replace(/\*(.*?)\*/g, '<em>$1</em>')
			// Links
			.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
			// Images
			.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%;" />')
			// Code blocks
			.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
			// Inline code
			.replace(/`([^`]+)`/g, '<code>$1</code>')
			// Blockquotes
			.replace(/^&gt; (.*$)/gim, '<blockquote>$1</blockquote>')
			// Horizontal rule
			.replace(/^---$/gim, '<hr />')
			// Unordered lists
			.replace(/^\* (.*$)/gim, '<li>$1</li>')
			.replace(/^- (.*$)/gim, '<li>$1</li>')
			// Line breaks and paragraphs
			.replace(/\n\n/g, '</p><p>')
			.replace(/\n/g, '<br />');
		
		// Wrap in paragraph tags
		html = '<p>' + html + '</p>';
		
		// Clean up empty paragraphs
		html = html.replace(/<p><\/p>/g, '');
		html = html.replace(/<p>(<h[1-6]>)/g, '$1');
		html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
		html = html.replace(/<p>(<blockquote>)/g, '$1');
		html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');
		html = html.replace(/<p>(<pre>)/g, '$1');
		html = html.replace(/(<\/pre>)<\/p>/g, '$1');
		html = html.replace(/<p>(<hr \/>)/g, '$1');
		html = html.replace(/(<hr \/>)<\/p>/g, '$1');
		
		// Wrap consecutive list items
		html = html.replace(/(<li>.*<\/li>)(\s*<br \/>)?/g, '<ul>$1</ul>');
		html = html.replace(/<\/ul>\s*<ul>/g, '');
		
		return html;
	}
	
	function insertMarkdown(prefix: string, suffix: string = '') {
		const textarea = document.getElementById(id) as HTMLTextAreaElement;
		if (!textarea) return;
		
		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selectedText = value.substring(start, end);
		
		const newText = value.substring(0, start) + prefix + selectedText + suffix + value.substring(end);
		value = newText;
		
		// Set cursor position after the operation
		setTimeout(() => {
			textarea.focus();
			if (selectedText) {
				textarea.setSelectionRange(start + prefix.length, end + prefix.length);
			} else {
				textarea.setSelectionRange(start + prefix.length, start + prefix.length);
			}
		}, 0);
	}
</script>

<div class="markdown-editor">
	<div class="toolbar">
		<button type="button" onclick={() => insertMarkdown('**', '**')} title="Bold">
			<strong>B</strong>
		</button>
		<button type="button" onclick={() => insertMarkdown('*', '*')} title="Italic">
			<em>I</em>
		</button>
		<button type="button" onclick={() => insertMarkdown('# ')} title="Heading 1">
			H1
		</button>
		<button type="button" onclick={() => insertMarkdown('## ')} title="Heading 2">
			H2
		</button>
		<button type="button" onclick={() => insertMarkdown('### ')} title="Heading 3">
			H3
		</button>
		<button type="button" onclick={() => insertMarkdown('[', '](url)')} title="Link">
			🔗
		</button>
		<button type="button" onclick={() => insertMarkdown('![alt](', ')')} title="Image">
			🖼️
		</button>
		<button type="button" onclick={() => insertMarkdown('`', '`')} title="Code">
			{'</>'}
		</button>
		<button type="button" onclick={() => insertMarkdown('```\n', '\n```')} title="Code Block">
			{'{ }'}
		</button>
		<button type="button" onclick={() => insertMarkdown('> ')} title="Quote">
			❝
		</button>
		<button type="button" onclick={() => insertMarkdown('- ')} title="List">
			•
		</button>
		<button type="button" onclick={() => insertMarkdown('---\n')} title="Horizontal Rule">
			—
		</button>
		<span class="toolbar-spacer"></span>
		<button 
			type="button" 
			class="preview-toggle"
			class:active={showPreview}
			onclick={() => showPreview = !showPreview}
		>
			{showPreview ? '✏️ Edit' : '👁️ Preview'}
		</button>
	</div>
	
	<div class="editor-container" class:split={showPreview}>
		<textarea
			{id}
			{name}
			bind:value
			placeholder="Write your content in Markdown..."
			class="editor-textarea"
		></textarea>
		
		{#if showPreview}
			<div class="preview">
				<div class="preview-content">
					{@html parseMarkdown(value)}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.markdown-editor {
		border: 2px solid var(--border, #d1d5db);
		border-radius: 8px;
		overflow: hidden;
		background: var(--bg-primary, var(--background));
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}
	
	.toolbar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		padding: 0.5rem;
		background: var(--bg-secondary, var(--surface));
		border-bottom: 1px solid var(--border, #d1d5db);
	}
	
	.toolbar button {
		padding: 0.375rem 0.625rem;
		border: 1px solid var(--border-color);
		background: var(--bg-primary);
		color: var(--text-primary);
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.875rem;
		min-width: 32px;
	}
	
	.toolbar button:hover {
		background: var(--bg-secondary);
		border-color: var(--primary-color);
	}
	
	.toolbar-spacer {
		flex: 1;
	}
	
	.preview-toggle {
		font-weight: 500;
	}
	
	.preview-toggle.active {
		background: var(--primary-color);
		color: white;
		border-color: var(--primary-color);
	}
	
	.editor-container {
		display: flex;
		min-height: 600px;
	}
	
	.editor-container.split .editor-textarea {
		width: 50%;
		border-right: 1px solid var(--border-color);
	}
	
	.editor-textarea {
		flex: 1;
		padding: 1rem;
		border: none;
		resize: vertical;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
		font-size: 0.9375rem;
		line-height: 1.6;
		background: var(--bg-primary);
		color: var(--text-primary);
		min-height: 600px;
	}
	
	.editor-textarea:focus {
		outline: none;
	}
	
	.preview {
		flex: 1;
		padding: 1rem;
		overflow-y: auto;
		max-height: 600px;
	}
	
	.preview-content {
		line-height: 1.7;
	}
	
	.preview-content :global(h1),
	.preview-content :global(h2),
	.preview-content :global(h3) {
		margin-top: 1.5rem;
		margin-bottom: 0.75rem;
	}
	
	.preview-content :global(h1) {
		font-size: 1.75rem;
	}
	
	.preview-content :global(h2) {
		font-size: 1.5rem;
	}
	
	.preview-content :global(h3) {
		font-size: 1.25rem;
	}
	
	.preview-content :global(p) {
		margin-bottom: 1rem;
	}
	
	.preview-content :global(code) {
		background: var(--bg-secondary);
		padding: 0.125rem 0.375rem;
		border-radius: 4px;
		font-family: 'Monaco', 'Menlo', monospace;
		font-size: 0.875em;
	}
	
	.preview-content :global(pre) {
		background: var(--bg-secondary);
		padding: 1rem;
		border-radius: 8px;
		overflow-x: auto;
		margin: 1rem 0;
	}
	
	.preview-content :global(pre code) {
		background: none;
		padding: 0;
	}
	
	.preview-content :global(blockquote) {
		border-left: 4px solid var(--primary-color);
		padding-left: 1rem;
		margin: 1rem 0;
		font-style: italic;
		color: var(--text-light);
	}
	
	.preview-content :global(ul) {
		margin: 1rem 0;
		padding-left: 1.5rem;
	}
	
	.preview-content :global(a) {
		color: var(--primary-color);
	}
	
	.preview-content :global(hr) {
		border: none;
		border-top: 1px solid var(--border-color);
		margin: 2rem 0;
	}
	
	.preview-content :global(img) {
		max-width: 100%;
		border-radius: 8px;
	}
</style>
