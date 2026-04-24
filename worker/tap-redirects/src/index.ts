/**
 * Tap.Giving Church Redirect Worker
 *
 * Handles redirects from tap.giving/churchname to each church's giving page.
 * Add new churches to the REDIRECTS object below.
 */

// ============================================================================
// CHURCH REDIRECTS CONFIGURATION
// Add new churches here: 'slug': 'destination-url'
// ============================================================================
const REDIRECTS: Record<string, string> = {
	'lifted': 'https://my.tap.giving/@lifted',
	'bayside': 'https://my.tap.giving/@bayside',
	'bethany': 'https://my.tap.giving/@bethanybaptist',
};

// ============================================================================
// LEGACY FILE REDIRECTS — old root-level comparison pages moved to /blog/
// Consolidated to eliminate duplicate content. Keep forever for backlink value.
// ============================================================================
const FILE_REDIRECTS: Record<string, string> = {
	'/overflow-tap-vs-tap-giving.html': '/blog/overflow-tap-vs-tap-giving.html',
	'/securegive-tap-vs-tap-giving.html': '/blog/securegive-tap-vs-tap-giving.html',
	'/subsplash-tap-vs-tap-giving.html': '/blog/subsplash-tap-vs-tap-giving.html',
	'/tap-tag-vs-tap-giving.html': '/blog/tap-tag-vs-tap-giving.html',
	'/tap-to-give-platform-comparison.html': '/blog/tap-to-give-platform-comparison.html',
	'/tithely-vs-tap-giving.html': '/blog/tithely-vs-tap-giving.html',
};

// ============================================================================
// WORKER LOGIC (no need to modify below unless customizing behavior)
// ============================================================================

interface Env {
	ANALYTICS: AnalyticsEngineDataset;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		// Redirect www to non-www
		if (url.hostname === 'www.tap.giving') {
			url.hostname = 'tap.giving';
			return Response.redirect(url.toString(), 301);
		}

		const path = url.pathname.toLowerCase();

		// Legacy file redirects (old root URLs → /blog/ canonical)
		const fileDestination = FILE_REDIRECTS[path];
		if (fileDestination) {
			url.pathname = fileDestination;
			return Response.redirect(url.toString(), 301);
		}

		// Remove leading slash and get the slug
		const slug = path.replace(/^\//, '').replace(/\/$/, '');

		// If empty path (root) or has file extension, pass through to origin
		if (!slug || slug === '' || slug.includes('.')) {
			return fetch(request);
		}

		// Look up the redirect destination
		const destination = REDIRECTS[slug];

		if (destination) {
			// Log the redirect to Analytics Engine
			env.ANALYTICS.writeDataPoint({
				blobs: [slug, destination],
				indexes: [slug],
			});

			// Found a match - redirect with 301 (permanent)
			return Response.redirect(destination, 301);
		}

		// No match found - pass through to origin (GitHub Pages)
		return fetch(request);
	},
} satisfies ExportedHandler<Env>;
