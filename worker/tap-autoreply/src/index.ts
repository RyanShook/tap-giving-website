/**
 * Tap.Giving Auto-Reply Worker
 *
 * Receives POST from the lead form and sends an auto-reply email
 * via Resend. Runs independently from the tap-redirects worker.
 *
 * Setup:
 *   1. Create a Resend account at resend.com
 *   2. Verify tap.giving domain in Resend
 *   3. Add API key as a secret:
 *      wrangler secret put RESEND_API_KEY
 */

interface Env {
	RESEND_API_KEY: string;
}

interface LeadData {
	church: string;
	email: string;
	name: string;
	quantity: string;
}

const CANVA_TEMPLATE_URL =
	'https://www.canva.com/design/DAHB7dHl1WM/PesDgn77CpfGpuBBLmFxcA/view?utm_content=DAHB7dHl1WM&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview';

function buildEmailHtml(data: LeadData): string {
	const greeting = data.church ? data.church : 'there';

	return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <p>Hey ${escapeHtml(greeting)},</p>

  <p>Thanks for your interest in tap-to-give plates. I'm Ryan, founder of Tap.Giving, and I'll personally follow up within 24 hours.</p>

  <p><strong>Want to speed things up?</strong> Reply to this email with two things and I'll have a free mockup of your plate ready when we talk:</p>
  <ol style="padding-left: 20px;">
    <li><strong>Your church logo</strong> (any format works)</li>
    <li><strong>Your giving page URL</strong> (Tithely, Pushpay, or whatever you use)</li>
  </ol>

  <p>Here's what one of our customers' plates looks like installed:</p>
  <p><img src="https://tap.giving/assets/pews-crop.jpg" alt="Tap.Giving NFC plate installed at Encounter the Lord Church" style="max-width: 100%; border-radius: 8px;" /></p>

  <p><strong>Quick overview:</strong></p>
  <ul style="padding-left: 20px;">
    <li>4" NFC tap plates customized with your church's branding</li>
    <li>$3.50–$4.50 per plate depending on quantity</li>
    <li>Free shipping, no monthly fees, no setup fees</li>
    <li>Works with any giving platform</li>
    <li>Production and delivery in 2–3 weeks</li>
  </ul>

  <p>You can also design your own plate using our free Canva template:<br>
  <a href="${CANVA_TEMPLATE_URL}" style="color: #2563eb;">Open Canva Template</a></p>

  <p>Just reply here or call me at <a href="tel:+18325108788" style="color: #2563eb;">(832) 510-8788</a>.</p>

  <p>Ryan Shook<br>
  Founder, <a href="https://tap.giving" style="color: #2563eb;">Tap.Giving</a></p>

</body>
</html>`;
}

function buildEmailText(data: LeadData): string {
	const greeting = data.church || 'there';

	return `Hey ${greeting},

Thanks for your interest in tap-to-give plates. I'm Ryan, founder of Tap.Giving, and I'll personally follow up within 24 hours.

Want to speed things up? Reply to this email with two things and I'll have a free mockup of your plate ready when we talk:

1. Your church logo (any format works)
2. Your giving page URL (Tithely, Pushpay, or whatever you use)

Quick overview:

- 4" NFC tap plates customized with your church's branding
- $3.50–$4.50 per plate depending on quantity
- Free shipping, no monthly fees, no setup fees
- Works with any giving platform
- Production and delivery in 2–3 weeks

You can also design your own plate using our free Canva template:
${CANVA_TEMPLATE_URL}

Just reply here or call me at (832) 510-8788.

Ryan Shook
Founder, Tap.Giving
https://tap.giving`;
}

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function isValidEmail(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		// CORS preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: {
					'Access-Control-Allow-Origin': 'https://tap.giving',
					'Access-Control-Allow-Methods': 'POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type',
					'Access-Control-Max-Age': '86400',
				},
			});
		}

		if (request.method !== 'POST') {
			return new Response('Method not allowed', { status: 405 });
		}

		const corsHeaders = {
			'Access-Control-Allow-Origin': 'https://tap.giving',
		};

		try {
			const data: LeadData = await request.json();

			if (!data.email || !isValidEmail(data.email)) {
				return new Response(JSON.stringify({ error: 'Invalid email' }), {
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				});
			}

			const resendResponse = await fetch('https://api.resend.com/emails', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${env.RESEND_API_KEY}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					from: 'Ryan Shook <ryan@send.tap.giving>',
					reply_to: 'ryan@tap.giving',
					to: [data.email],
					subject: "Got your request — I'll follow up shortly",
					html: buildEmailHtml(data),
					text: buildEmailText(data),
				}),
			});

			if (!resendResponse.ok) {
				const err = await resendResponse.text();
				console.error('Resend API error:', err);
				return new Response(JSON.stringify({ error: 'Email send failed' }), {
					status: 502,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				});
			}

			return new Response(JSON.stringify({ ok: true }), {
				status: 200,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		} catch (err) {
			console.error('Worker error:', err);
			return new Response(JSON.stringify({ error: 'Internal error' }), {
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}
	},
} satisfies ExportedHandler<Env>;
