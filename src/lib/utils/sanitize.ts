import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Allows safe HTML tags while stripping dangerous elements.
 */
export function sanitizeHtml(dirty: string): string {
	return DOMPurify.sanitize(dirty, {
		ALLOWED_TAGS: [
			'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
			'p', 'br', 'hr',
			'ul', 'ol', 'li',
			'strong', 'b', 'em', 'i', 'u', 's', 'strike',
			'a', 'img',
			'blockquote', 'pre', 'code',
			'table', 'thead', 'tbody', 'tr', 'th', 'td',
			'div', 'span',
			'sup', 'sub'
		],
		ALLOWED_ATTR: [
			'href', 'src', 'alt', 'title', 'class', 'id',
			'target', 'rel',
			'width', 'height'
		],
		ALLOW_DATA_ATTR: false,
		ADD_ATTR: ['target'], // Allow target attribute
		FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'button'],
		FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover', 'onfocus', 'onblur']
	});
}

/**
 * Sanitize plain text - escape all HTML
 */
export function escapeHtml(text: string): string {
	const div = typeof document !== 'undefined' 
		? document.createElement('div')
		: null;
	
	if (div) {
		div.textContent = text;
		return div.innerHTML;
	}
	
	// Fallback for SSR
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

/**
 * Convert newlines to <br> tags safely
 */
export function nlToBr(text: string): string {
	return escapeHtml(text).replace(/\n/g, '<br>');
}
