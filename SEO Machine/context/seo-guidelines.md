# SEO Guidelines for Tap.Giving Content

This document outlines SEO best practices and requirements for all Tap.Giving blog content to maximize organic search visibility and rankings.

## Content Length Requirements

### Target Word Counts
- **Standard Blog Post**: 1,500–2,500 words (target: 2,000)
- **Pillar Content / Comprehensive Guides**: 2,500–4,000 words maximum
- **Setup Guides**: 1,200–2,000 words
- **Competitor Comparisons**: 1,500–2,500 words
- **Seasonal Strategy Posts**: 1,500–2,000 words

### Important Length Guidelines
- **Maximum for most articles**: 3,000 words
- **Maximum for pillar content**: 4,000 words
- If a topic requires more, break it into a series of related articles
- Quality over quantity — don't pad content to hit word counts

## Keyword Optimization

### Keyword Density Guidelines
- **Primary Keyword**: 1–2% density
- **Secondary Keywords**: 0.5–1% density each
- **LSI Keywords**: Sprinkle throughout naturally
- Natural integration is critical — never force keywords

### Critical Keyword Placement
Primary keyword MUST appear in:
- [ ] H1 headline (preferably near the beginning)
- [ ] First 100 words of article
- [ ] At least 2–3 H2 subheadings
- [ ] Last paragraph / conclusion
- [ ] Meta title (within first 60 characters)
- [ ] Meta description
- [ ] URL slug

### Keyword Integration Best Practices
- **Natural language first**: Write for church leaders, optimize for search engines
- **Use variations**: Don't repeat exact phrase robotically
  - "NFC giving" → "tap-to-give" → "NFC plates" → "tap giving"
- **Question formats**: Include conversational variations
  - "How does NFC giving work?" / "setting up NFC giving"
- **Semantic keywords**: Use related terms to support topical authority
  - For "NFC giving": include "tap to donate", "contactless offering", "digital giving", "church technology"

## Content Structure Requirements

### Heading Hierarchy

#### H1 (Title)
- **Only one H1 per article**
- Include primary keyword naturally
- 60 characters or less (for SERP display)
- Compelling and benefit-focused
- Examples from our blog:
  - "NFC Giving for Small Churches: Big Results on a Tight Budget"
  - "QR Codes vs NFC Tap-to-Give: Why Churches Are Making the Switch"
  - "Tithely Tap-to-Give vs Tap.Giving — Complete Comparison 2026"

#### H2 (Main Sections)
- **5–9 H2 sections** for standard articles
- At least **2–3 should include keyword variations**
- Numbered sections work well for our content (e.g., "1. The Small Church Budget Reality")
- Descriptive and keyword-rich

#### H3 (Subsections)
- Nested under H2s (never skip from H2 to H4)
- Break complex sections into digestible chunks
- Include keywords where natural

### Standard Article Template

```
H1: [Compelling Title with Primary Keyword]

Intro paragraph (100–200 words):
- Hook with problem or statistic
- Context for church leaders
- Promise of what they'll learn
- Primary keyword in first 100 words

Table of Contents (for posts over 1,500 words)

H2: Section 1 [Include keyword variation]
  Body text (200–300 words)
  Visual element (callout box, stat, comparison table)

H2: Section 2
  Body text
  Visual element

H2: Section 3 [Include keyword variation]
  Body text
  Visual element

[Continue with 5–9 total H2 sections]

H2: Conclusion / Next Steps
  Recap key takeaways
  CTA to order page or contact
  Include primary keyword
```

### Visual Elements We Use
- **Callout boxes**: Gradient backgrounds with left border (amber for warnings, blue for tips, green for success)
- **Stat cards**: Grid layouts showing key numbers (100 plates, $450, $0/mo)
- **Comparison tables**: Side-by-side with green checkmarks vs. red X marks
- **Icon grids**: 3-column layouts with Font Awesome icons
- **FAQ accordions**: Structured data-ready Q&A sections

## Meta Elements

### Meta Title
- **Length**: 50–60 characters including "| Tap.Giving"
- **Primary keyword**: Must be included
- **Format Options**:
  - `[Topic]: [Benefit] | Tap.Giving`
  - `[Product A] vs [Product B] - [Value Prop] | Tap.Giving`
  - `How to [Goal] with [Product] | Tap.Giving`

### Meta Description
- **Length**: 150–160 characters
- **Include**: Primary keyword + value proposition + CTA
- **Formula**: `[Problem/Question]? [Solution]. [Differentiator]. [CTA].`
- **Example**: "NFC tap-to-give plates for churches — $3.50–$4.50/plate, no monthly fees, works with any giving platform. Get your free quote today."

### URL Slugs
- Lowercase, hyphens between words
- Include primary keyword
- 3–6 words ideal
- **Format**: `/blog/[keyword-phrase].html`
- **Our pattern**: descriptive, keyword-rich slugs
  - `/blog/nfc-giving-small-churches.html`
  - `/blog/tithely-vs-tap-giving.html`
  - `/blog/easter-tap-to-give-church-strategy.html`

## Internal Linking Strategy

### Requirements Per Article
- **Minimum**: 3 internal links
- **Optimal**: 4–6 internal links
- **Maximum**: 8 internal links (for 3,000+ word articles)

### Link Priority
1. **Order/pricing page** (1 link): Primary conversion CTA
2. **Related pillar content** (1–2 links): Build topic cluster authority
3. **Related blog posts** (2–3 links): Cross-link within clusters
4. **How it works / NFC FAQ** (0–1 link): When explaining NFC basics

### Anchor Text Best Practices
- Descriptive and keyword-rich
- Vary anchor text for the same destination
- Never use "click here" or "read more"
- Examples:
  - "our complete NFC giving guide"
  - "see how Tap.Giving compares to Tithely"
  - "view our pricing"

### Reference
Always check `context/internal-links-map.md` for priority linking targets and suggested anchor text.

## External Linking Strategy

### Requirements
- **Minimum**: 1–2 external links per article
- **Purpose**: Cite statistics, reference studies, link to competitor sites (when discussing them)

### What to Link
- Statistics sources (Barna Group, Pew Research, church technology studies)
- Competitor websites (when doing comparisons — it's fair and builds credibility)
- Industry publications and research

## Structured Data / Schema Markup

### Every Blog Post Must Include
1. **BreadcrumbList**: Home → Blog → Post Title
2. **BlogPosting**: Headline, description, author (Tap.Giving), publisher, dates, image

### Comparison Posts Should Include
- **WebPage** with `about` property listing both products as `Product` entities

### FAQ Sections Should Include
- **FAQPage** schema with `Question` and `acceptedAnswer` for each FAQ item

### Pricing/Product Pages Should Include
- **Product** schema with pricing, availability, and offers

## Featured Snippet Optimization

### Optimize Blog Posts for Snippets
- **Question-based H2s**: "What Is NFC Giving?" → 40–60 word answer immediately after
- **Comparison tables**: Side-by-side feature/pricing tables
- **Numbered lists**: Step-by-step processes (3–8 items)
- **Definition snippets**: Clear, concise definitions after the heading

### Example (Definition Snippet)
```
## What Is NFC Giving?

NFC giving uses near-field communication technology to let churchgoers donate by tapping their smartphone on an NFC-enabled plate mounted on a pew or chair. The tap opens the church's giving page directly in the phone's browser — no app download or account creation required.
```

## Page Technical Standards

### Our Stack (Maintain These)
- **Static HTML** — no frameworks, fast loading
- **Tailwind CSS via CDN** — utility classes
- **Font**: Inter (Google Fonts, lazy-loaded)
- **Icons**: Font Awesome 6 (preloaded)
- **Analytics**: GA4 (GA-L3B3M72XEP)

### Performance Requirements
- Keep pages fast — static HTML is our advantage
- Lazy-load images below the fold
- Use WebP format for images with JPEG fallback
- Preload critical assets (fonts, icon library)
- No heavy JavaScript frameworks

### Mobile Requirements
- Mobile-first responsive design
- Short paragraphs (2–4 sentences)
- Full-width CTAs on mobile
- Touch-friendly tap targets
- Readable without zooming (16px+ base font)

## Content Refresh Strategy

### When to Update Content
- Statistics are more than 12 months old
- Competitor pricing or features have changed
- Rankings have declined for target keyword
- New relevant information available (new competitor, new feature)
- Seasonal content should be refreshed annually (Easter, Christmas, year-end)

### What to Update
- `dateModified` in schema markup
- Statistics with current data and sources
- Pricing if competitor prices changed
- Internal links to newer content
- Meta elements if target keyword has shifted

## SEO Checklist for Every Article

Before publishing, verify:

### Content
- [ ] Appropriate word count for content type
- [ ] Primary keyword identified and integrated at 1–2% density
- [ ] 3–5 secondary keywords included
- [ ] LSI/semantic keywords naturally integrated
- [ ] Provides unique value vs. competitor content on same topic
- [ ] Statistics sourced and current

### Structure
- [ ] One H1 with primary keyword
- [ ] 5–9 H2 sections
- [ ] 2–3 H2s include keyword variations
- [ ] Proper H1 → H2 → H3 hierarchy (no skipping)
- [ ] Keyword in first 100 words
- [ ] Keyword in conclusion
- [ ] Table of contents for posts over 1,500 words

### Meta Elements
- [ ] Meta title 50–60 characters with keyword
- [ ] Meta description 150–160 characters with keyword and CTA
- [ ] URL slug includes primary keyword
- [ ] Open Graph tags (title, description, image, URL)
- [ ] Twitter Card tags
- [ ] Canonical URL set

### Schema Markup
- [ ] BreadcrumbList schema
- [ ] BlogPosting schema (or appropriate type)
- [ ] FAQPage schema if FAQ section present

### Links
- [ ] 3–6 internal links with descriptive anchor text
- [ ] 1–2 external authority links
- [ ] All links functional
- [ ] Links reference `internal-links-map.md` targets

### Readability
- [ ] 8th–10th grade reading level
- [ ] Average sentence length 12–20 words
- [ ] Paragraphs 2–4 sentences
- [ ] Subheadings every 200–400 words
- [ ] Visual elements (callout boxes, tables, stat cards) break up text
- [ ] Active voice predominant

### Technical
- [ ] Static HTML (matches existing site template)
- [ ] Tailwind CSS classes used
- [ ] Images optimized (WebP with fallback)
- [ ] Images have descriptive alt text
- [ ] Page loads fast (no heavy dependencies)
- [ ] Mobile responsive
- [ ] Skip-to-content link present
- [ ] sitemap.xml updated if new page

---

**Remember**: SEO serves the church leader searching for solutions, not the algorithm. Never sacrifice content quality or honesty for keyword optimization. The best SEO for Tap.Giving is content that genuinely helps churches make informed decisions about giving technology.
