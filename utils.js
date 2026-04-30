// Generic string utilities. Pure functions. No dependencies.
// Used by mapper.js for filename generation and text cleanup.
//
// Both functions are also valid in browser context — if you need them
// browser-side, copy-paste verbatim or import via a build step.

// ---------------------------------------------------------------------------
// slugify
// Accepts a label, URL path, or full URL. Produces a filesystem-safe slug.
// Same input class -> same output. One function, all cases.
//
//   slugify('Home')                                    -> 'home'
//   slugify('Our Team')                                -> 'our-team'
//   slugify('Fees/Financing')                          -> 'fees-financing'
//   slugify('/our-team/')                              -> 'our-team'
//   slugify('https://aoavirginia.com/ketamine')        -> 'ketamine'
//   slugify('https://aoavirginia.com/fees-financing/') -> 'fees-financing'
// ---------------------------------------------------------------------------
export function slugify(input) {
	if (!input) return '';
	let s = String(input).trim();
	// strip protocol + domain if present
	s = s.replace(/^https?:\/\/[^/]+/i, '');
	// lowercase
	s = s.toLowerCase();
	// any non-alphanumeric run becomes a single dash
	s = s.replace(/[^a-z0-9]+/g, '-');
	// trim leading/trailing dashes
	s = s.replace(/^-+|-+$/g, '');
	return s;
}

// ---------------------------------------------------------------------------
// normalizeText
// Cleans up text artifacts that Wix (and similar SaaS site builders) inject
// during render. Safe to run on any string.
//
// Handles:
//   - non-breaking spaces and zero-width characters
//   - HTML entity escapes (&amp; &nbsp; &#39; etc.) - basic set
//   - the "single letter + space + lowercase" pattern Wix produces for
//     screen-reader prefixes (e.g. "I ntegration" -> "Integration",
//     "S itemap" -> "Sitemap")
//   - collapsed multi-spaces
//
// Does NOT handle:
//   - mid-word breaks like "evidenced-b ased" - too ambiguous without
//     a dictionary. These need manual review per site.
// ---------------------------------------------------------------------------
export function normalizeText(input) {
	if (!input) return '';
	let s = String(input);

	// HTML entity decode (small set - the common ones Wix emits)
	s = s
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&#39;/g, "'")
		.replace(/&quot;/g, '"')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>');

	// Replace non-breaking and zero-width whitespace with regular space
	s = s.replace(/[\u00A0\u200B\u200C\u200D\uFEFF]/g, ' ');

	// Fix Wix's screen-reader split: "I ntegration" -> "Integration"
	// Pattern: word boundary + single capital letter + space + lowercase letter
	s = s.replace(/\b([A-Z]) ([a-z])/g, '$1$2');

	// Collapse multiple spaces
	s = s.replace(/\s+/g, ' ');

	return s.trim();
}
