# Cloudflare Worker Redirect Setup

Manages church-specific redirects: `tap.giving/churchname` → church's giving page.

## Quick Start: Adding a New Church

1. **Edit** `worker/tap-redirects/src/index.ts`:
   ```typescript
   const REDIRECTS: Record<string, string> = {
     'lifted': 'https://my.tap.giving/@lifted',
     'newchurch': 'https://their-giving-url.com',  // ← add here
   };
   ```

2. **Deploy:**
   ```bash
   cd worker/tap-redirects
   npm run deploy
   ```

3. **Test:** Visit `https://tap.giving/newchurch`

## Current Redirects

| Slug | Destination |
|------|-------------|
| `/lifted` | https://my.tap.giving/@lifted |

## How It Works

- `tap.giving/slug` → if slug exists in REDIRECTS, 301 redirect to destination
- `tap.giving/slug` → if slug doesn't exist, passes through to GitHub Pages (404)
- `tap.giving/` → passes through to GitHub Pages (main site)
- `www.tap.giving/*` → 301 redirect to `tap.giving/*`

## File Structure

```
worker/tap-redirects/
├── src/index.ts       # Redirect config + logic
├── wrangler.jsonc     # Cloudflare config
└── package.json
```

## Managing Redirects

### Add a Church

Add to the `REDIRECTS` object in `src/index.ts`:
```typescript
const REDIRECTS: Record<string, string> = {
  'existing': 'https://existing-url.com',
  'newchurch': 'https://new-url.com',
};
```

### Update a Church URL

Change the destination URL in `REDIRECTS`, then deploy.

### Remove a Church

Delete the line from `REDIRECTS`, then deploy.

### Naming Rules

- Lowercase only
- No spaces (use hyphens if needed)
- Keep short and memorable

Good: `firstbaptist`, `grace-church`, `stmarys`
Bad: `FirstBaptist`, `my church`, `First_Baptist_Church_Of_Dallas`

## Deployment

### Prerequisites

```bash
npm install -g wrangler
wrangler login
```

### Deploy

```bash
cd worker/tap-redirects
npm run deploy
```

### Test Locally

```bash
cd worker/tap-redirects
npm run dev
# Visit http://localhost:8787/lifted
```

## Worker Code Reference

```typescript
const REDIRECTS: Record<string, string> = {
  'lifted': 'https://my.tap.giving/@lifted',
};

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // www → non-www redirect
    if (url.hostname === 'www.tap.giving') {
      url.hostname = 'tap.giving';
      return Response.redirect(url.toString(), 301);
    }

    const slug = url.pathname.toLowerCase().replace(/^\//, '').replace(/\/$/, '');

    // Root or files → pass through to origin
    if (!slug || slug.includes('.')) {
      return fetch(request);
    }

    // Known redirect → 301
    const destination = REDIRECTS[slug];
    if (destination) {
      return Response.redirect(destination, 301);
    }

    // Unknown → pass through to origin (GitHub Pages 404)
    return fetch(request);
  },
};
```

## Troubleshooting

**Redirect not working after deploy:**
- Clear browser cache or use incognito
- Flush DNS: `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`

**Deploy fails:**
- Re-login: `wrangler login`
- Check you're in the right directory: `cd worker/tap-redirects`

**Test via curl:**
```bash
curl -I https://tap.giving/lifted
# Should show: location: https://my.tap.giving/@lifted
```

## DNS Setup (Already Configured)

The following DNS records must be **proxied** (orange cloud) in Cloudflare:

- `tap.giving` A records → Cloudflare IPs (proxied)
- `www.tap.giving` CNAME → tap.giving (proxied)

Worker routes:
- `tap.giving/*`
- `www.tap.giving/*`

## Support

- **Email:** hello@tap.giving
- **Phone:** (832) 510-8788
