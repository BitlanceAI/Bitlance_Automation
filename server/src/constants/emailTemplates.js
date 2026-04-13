/**
 * Email template for PDF/Guide delivery (Path A: Download)
 * @param {object} lead - The lead object from Supabase
 * @returns {string} HTML email content
 */
export const PDF_DELIVERY_TEMPLATE = (lead) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:8px; overflow:hidden;">
        <tr>
            <td style="padding:40px 30px; text-align:center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <h1 style="color:#ffffff; margin:0; font-size:24px;">Your CRM Automation Guide 📦</h1>
            </td>
        </tr>
        <tr>
            <td style="padding:30px;">
                <p style="font-size:16px; color:#333;">Hi ${lead.name || 'there'},</p>
                <p style="font-size:16px; color:#333; line-height:1.6;">
                    Thank you for downloading our CRM Automation Guide! Inside, you'll discover proven strategies
                    to automate your lead management, reduce response times, and increase conversions.
                </p>
                <div style="text-align:center; margin:30px 0;">
                    <a href="#" style="display:inline-block; padding:14px 32px; background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); color:#fff; text-decoration:none; border-radius:6px; font-size:16px; font-weight:bold;">
                        📥 Download Your Guide
                    </a>
                </div>
                <p style="font-size:14px; color:#666; line-height:1.6;">
                    Have questions? Just reply to this email — we're happy to help.
                </p>
            </td>
        </tr>
        <tr>
            <td style="padding:20px 30px; background:#f8f8f8; text-align:center;">
                <p style="font-size:12px; color:#999; margin:0;">© ${new Date().getFullYear()} South Bay Investment. All rights reserved.</p>
            </td>
        </tr>
    </table>
</body>
</html>
`;

/**
 * Email template for booking confirmation
 * @param {string} name - Lead's name
 * @param {string|null} formattedTime - Formatted booking time string, or null
 * @returns {string} HTML email content
 */
export const BOOKING_CONFIRMATION_TEMPLATE = (name, formattedTime) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:8px; overflow:hidden;">
        <tr>
            <td style="padding:40px 30px; text-align:center; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);">
                <h1 style="color:#ffffff; margin:0; font-size:24px;">Your Strategy Session is Confirmed! ✅</h1>
            </td>
        </tr>
        <tr>
            <td style="padding:30px;">
                <p style="font-size:16px; color:#333;">Hi ${name || 'there'},</p>
                <p style="font-size:16px; color:#333; line-height:1.6;">
                    Great news — your strategy session has been confirmed!
                </p>
                ${formattedTime ? `
                <div style="background:#f0fdf4; border-left:4px solid #38ef7d; padding:16px 20px; margin:20px 0; border-radius:4px;">
                    <p style="margin:0; font-size:16px; color:#333;">
                        📅 <strong>${formattedTime}</strong>
                    </p>
                </div>
                ` : ''}
                <p style="font-size:16px; color:#333; line-height:1.6;">
                    We'll walk you through how AI-powered automation can transform your lead management
                    and help you close more deals with less effort.
                </p>
                <p style="font-size:14px; color:#666; line-height:1.6;">
                    Need to reschedule? Just reply to this email and we'll sort it out.
                </p>
            </td>
        </tr>
        <tr>
            <td style="padding:20px 30px; background:#f8f8f8; text-align:center;">
                <p style="font-size:12px; color:#999; margin:0;">© ${new Date().getFullYear()} South Bay Investment. All rights reserved.</p>
            </td>
        </tr>
    </table>
</body>
</html>
`;

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL SEQUENCES — Welcome · Lead Nurture · Re-engagement
// Each sequence is an ordered array of { subject, preview, html } functions.
// The emailSequenceService picks the correct step by index.
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = process.env.CLIENT_URL || 'https://www.bitlancetechhub.com';

const emailLayout = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:4px;overflow:hidden;border-top:4px solid #26CECE;">
        <!-- Header -->
        <tr>
          <td style="padding:28px 32px 20px;border-bottom:1px solid #f0f0f0;">
            <span style="font-size:20px;font-weight:900;color:#070707;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">BITLANCE</span>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:32px;">${content}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;background:#f8f8f8;border-top:1px solid #f0f0f0;">
            <p style="margin:0;font-size:12px;color:#999;line-height:1.6;">
              You're receiving this because you signed up at Bitlance.<br>
              <a href="${BASE_URL}/unsubscribe" style="color:#26CECE;">Unsubscribe</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const btn = (text, url) =>
    `<div style="margin:28px 0;text-align:center;">
       <a href="${url}" style="display:inline-block;padding:14px 32px;background:#26CECE;color:#070707;text-decoration:none;font-weight:900;font-size:14px;letter-spacing:1px;text-transform:uppercase;border-radius:2px;">${text}</a>
     </div>`;

const p = (text) => `<p style="font-size:15px;color:#333;line-height:1.7;margin:0 0 16px;">${text}</p>`;

// ── WELCOME SEQUENCE (7 emails · 14 days) ────────────────────────────────────
export const WELCOME_EMAIL_TEMPLATES = [
    // Step 0 — Immediate
    {
        subject: `You're in — here's where to start`,
        preview: `One setup step makes everything else click.`,
        html: (name) => emailLayout(`
            ${p(`Hey ${name || 'there'},`)}
            ${p(`Welcome to Bitlance — you just made managing Meta Ads a lot less painful.`)}
            ${p(`Before you explore, do one thing first: <strong>connect your Meta account.</strong>`)}
            ${p(`It takes 2 minutes and unlocks everything — your ad accounts, pages, pixel data, and campaign tools.`)}
            ${btn('Connect Meta Account', `${BASE_URL}/dashboard/agents/meta`)}
            ${p(`Once that's done, you're ready to launch your first campaign.`)}
            ${p(`— Team Bitlance`)}
        `)
    },
    // Step 1 — Day 1
    {
        subject: `Your first campaign in under 10 minutes`,
        preview: `Pick a goal, fill the wizard, done.`,
        html: (name) => emailLayout(`
            ${p(`Hey ${name || 'there'},`)}
            ${p(`Most people spend hours setting up a single Meta campaign — audience research, creative uploads, budget splits, placements.`)}
            ${p(`With Bitlance, you pick your campaign type, fill in the wizard, and we handle the structure.`)}
            ${p(`We support <strong>9 campaign types</strong>: awareness, traffic, engagement, lead gen, conversions, app promotion, local business, remarketing, and offer events.`)}
            ${p(`Start with whichever matches your current goal.`)}
            ${btn('Launch Your First Campaign', `${BASE_URL}/dashboard/agents/meta`)}
            ${p(`— Team Bitlance`)}
        `)
    },
    // Step 2 — Day 3
    {
        subject: `Why we built this (the honest version)`,
        preview: `Meta Ads shouldn't require a full-time specialist.`,
        html: (name) => emailLayout(`
            ${p(`Hey ${name || 'there'},`)}
            ${p(`Running Meta Ads used to mean: hours in Ads Manager, guessing at audiences, manually duplicating campaigns, and hoping the algorithm cooperates.`)}
            ${p(`We built Bitlance because that process is broken for anyone without a dedicated media buyer on staff.`)}
            ${p(`The platform automates the repetitive parts — campaign structure, scheduling, pixel tracking, CAPI events — so you can focus on strategy and creative.`)}
            ${p(`If you haven't connected your Meta account yet, this is the right moment.`)}
            ${btn('Get Started', `${BASE_URL}/dashboard/agents/meta`)}
            ${p(`— Team Bitlance`)}
        `)
    },
    // Step 3 — Day 5
    {
        subject: `What businesses are running on Bitlance`,
        preview: `Real campaigns, real results.`,
        html: (name) => emailLayout(`
            ${p(`Hey ${name || 'there'},`)}
            ${p(`Here's what Bitlance users are typically running:`)}
            <ul style="font-size:15px;color:#333;line-height:2;padding-left:20px;margin:0 0 16px;">
              <li><strong>E-commerce brands</strong> → conversion campaigns with remarketing layers</li>
              <li><strong>Local businesses</strong> → local awareness + lead gen campaigns</li>
              <li><strong>Agencies</strong> → managing multiple ad accounts from one dashboard</li>
              <li><strong>SMBs</strong> → traffic + engagement campaigns without a media buyer</li>
            </ul>
            ${p(`You don't need a big budget or a specialist. You need the right structure.`)}
            ${btn('See How It Works', `${BASE_URL}/features`)}
            ${p(`— Team Bitlance`)}
        `)
    },
    // Step 4 — Day 7
    {
        subject: `"I'm not sure Meta Ads work for my business"`,
        preview: `Here's an honest answer.`,
        html: (name) => emailLayout(`
            ${p(`Hey ${name || 'there'},`)}
            ${p(`Fair concern. Meta Ads don't work for everyone — but they fail most often because of poor structure, not poor fit.`)}
            ${p(`Bad audience targeting. Campaigns with no clear objective. No pixel signal. Ads running at the wrong time.`)}
            ${p(`Bitlance fixes the structure problem. The campaign wizard forces the right decisions upfront — objective, audience, budget, schedule.`)}
            ${p(`If the ads still don't perform, you'll know it's the creative or the offer — not the setup.`)}
            ${btn('Build a Properly Structured Campaign', `${BASE_URL}/dashboard/agents/meta`)}
            ${p(`— Team Bitlance`)}
        `)
    },
    // Step 5 — Day 10
    {
        subject: `Set it up once, let it run`,
        preview: `Campaign scheduling is the most underused feature in Bitlance.`,
        html: (name) => emailLayout(`
            ${p(`Hey ${name || 'there'},`)}
            ${p(`One feature most users discover late: <strong>campaign scheduling.</strong>`)}
            ${p(`Instead of logging in to pause and resume campaigns manually, you set a start date, end date, and budget — and Bitlance handles the rest.`)}
            ${p(`It's especially useful for seasonal promotions, limited-time offers, and event-based campaigns.`)}
            ${p(`Set it up in the campaign wizard under "Schedule."`)}
            ${btn('Try the Scheduler', `${BASE_URL}/dashboard/agents/meta`)}
            ${p(`— Team Bitlance`)}
        `)
    },
    // Step 6 — Day 14
    {
        subject: `Ready to run ads at scale?`,
        preview: `Upgrade and remove the limits.`,
        html: (name) => emailLayout(`
            ${p(`Hey ${name || 'there'},`)}
            ${p(`You've had two weeks to explore Bitlance.`)}
            ${p(`If you're ready to run campaigns without restrictions — more ad accounts, more campaign types, full CAPI integration — it's time to upgrade.`)}
            ${btn('See Plans', `${BASE_URL}/pricing`)}
            ${p(`Questions before you decide? Reply here — a real person will answer.`)}
            ${p(`— Team Bitlance`)}
        `)
    }
];

// Days from sequence start when each step fires
export const WELCOME_DELAYS = [0, 1, 3, 5, 7, 10, 14];

// ── LEAD NURTURE SEQUENCE (8 emails · 21 days) ───────────────────────────────
export const NURTURE_EMAIL_TEMPLATES = [
    // Step 0 — Immediate
    {
        subject: `The #1 reason Meta Ads underperform`,
        preview: `Most Meta Ads fail before the ad even runs.`,
        html: (name) => emailLayout(`
            ${p(`Hey ${name || 'there'},`)}
            ${p(`Most Meta Ads underperform because the campaign structure is wrong — not the creative.`)}
            ${p(`Wrong objective. Loose audiences. No pixel signal feeding back. Ads running at the wrong time.`)}
            ${p(`Over the next few weeks I'll share exactly how to fix each of these — and how Bitlance automates the whole process.`)}
            ${btn('See Bitlance in Action', `${BASE_URL}/features`)}
            ${p(`— Team Bitlance`)}
        `)
    },
    // Step 1 — Day 2
    {
        subject: `The 3 Meta Ads mistakes that waste the most budget`,
        preview: `Mistake #2 is the one nobody talks about.`,
        html: (name) => emailLayout(`
            ${p(`Hey ${name || 'there'},`)}
            ${p(`Three mistakes that drain Meta Ads budgets silently:`)}
            <ol style="font-size:15px;color:#333;line-height:2;padding-left:20px;margin:0 0 16px;">
              <li><strong>Wrong campaign objective</strong> — Running Traffic when you want sales. Meta optimizes for what you tell it.</li>
              <li><strong>No CAPI integration</strong> — Browser pixels miss 20–40% of conversions post-iOS 14. Without server-side events, Meta's algorithm is flying blind.</li>
              <li><strong>No scheduling</strong> — Ads running 24/7 when your customers convert in a 6-hour window.</li>
            </ol>
            ${p(`All three are fixable. Bitlance handles all of them.`)}
            ${btn('See How', `${BASE_URL}/features`)}
            ${p(`— Team Bitlance`)}
        `)
    },
    // Step 2 — Day 5
    {
        subject: `Why managing Meta Ads manually doesn't scale`,
        preview: `It's not you. The process is just broken.`,
        html: (name) => emailLayout(`
            ${p(`Hey ${name || 'there'},`)}
            ${p(`Here's what managing Meta Ads manually actually looks like:`)}
            ${p(`→ Log into Ads Manager. Duplicate last campaign. Adjust audience. Upload creative. Set budget. Pray.`)}
            ${p(`Multiply that by 5 campaigns, 3 ad accounts, and 2 clients — and you have a full-time job that produces inconsistent results.`)}
            ${p(`The agencies and in-house teams that scale Meta Ads aren't smarter. They've automated the repetitive parts.`)}
            ${p(`That's what Bitlance is built for.`)}
            ${btn('See Bitlance in Action', `${BASE_URL}/features`)}
            ${p(`— Team Bitlance`)}
        `)
    },
    // Step 3 — Day 8
    {
        subject: `How a proper Meta Ads setup actually looks`,
        preview: `Structure first, creative second, scale third.`,
        html: (name) => emailLayout(`
            ${p(`Hey ${name || 'there'},`)}
            ${p(`The teams that consistently get results from Meta Ads follow the same pattern:`)}
            <ul style="font-size:15px;color:#333;line-height:2;padding-left:20px;margin:0 0 16px;">
              <li><strong>Layer 1 — Structure:</strong> Right objective. Correct campaign type. Audience matched to funnel stage.</li>
              <li><strong>Layer 2 — Tracking:</strong> Meta Pixel + CAPI sending clean conversion signals.</li>
              <li><strong>Layer 3 — Scheduling:</strong> Campaigns run when the audience converts.</li>
              <li><strong>Layer 4 — Remarketing:</strong> Warm audiences get different ads than cold ones.</li>
            </ul>
            ${p(`Bitlance lets you build all four layers through a single campaign wizard.`)}
            ${btn('Try Bitlance Free', `${BASE_URL}/signup`)}
            ${p(`— Team Bitlance`)}
        `)
    },
    // Step 4 — Day 10
    {
        subject: `How teams cut campaign setup time by 80%`,
        preview: `Same results, less manual work.`,
        html: (name) => emailLayout(`
            ${p(`Hey ${name || 'there'},`)}
            ${p(`Before Bitlance, a typical campaign setup: 45 minutes in Ads Manager per campaign, manual audience research, separate pixel setup, no consistent naming, no scheduling.`)}
            ${p(`With Bitlance:`)}
            <ul style="font-size:15px;color:#333;line-height:2;padding-left:20px;margin:0 0 16px;">
              <li>Campaign wizard guides setup in under 10 minutes</li>
              <li>9 campaign types with structured objectives</li>
              <li>CAPI integration built in</li>
              <li>Scheduler handles start/end automatically</li>
            </ul>
            ${p(`The creative still takes time. The setup doesn't have to.`)}
            ${btn('Start Free', `${BASE_URL}/signup`)}
            ${p(`— Team Bitlance`)}
        `)
    },
    // Step 5 — Day 13
    {
        subject: `Why Bitlance isn't just another Ads Manager wrapper`,
        preview: `The difference is in what's automated.`,
        html: (name) => emailLayout(`
            ${p(`Hey ${name || 'there'},`)}
            ${p(`There are tools that let you view Meta Ads data in a prettier dashboard.`)}
            ${p(`Bitlance is different — it automates the campaign creation process itself.`)}
            <ul style="font-size:15px;color:#333;line-height:2;padding-left:20px;margin:0 0 16px;">
              <li>9 campaign type wizards (not blank forms)</li>
              <li>Server-side CAPI integration (not just browser pixel)</li>
              <li>Built-in scheduler (not manual pause/resume)</li>
              <li>AI-assisted content for ad creatives</li>
              <li>Google Sheets lead sync for lead gen campaigns</li>
            </ul>
            ${btn('See All Features', `${BASE_URL}/features`)}
            ${p(`— Team Bitlance`)}
        `)
    },
    // Step 6 — Day 17
    {
        subject: `"I already use Ads Manager directly — why change?"`,
        preview: `Honest answer inside.`,
        html: (name) => emailLayout(`
            ${p(`Hey ${name || 'there'},`)}
            ${p(`If Ads Manager is working for you, don't change.`)}
            ${p(`Bitlance is built for a specific situation: you're running Meta Ads across multiple campaign types or accounts, the setup is repetitive, and results are inconsistent because the structure isn't standardized.`)}
            ${p(`If that's not you — genuinely, stick with what works.`)}
            ${p(`If that is you — Bitlance is worth 10 minutes to try.`)}
            ${btn('Start Free', `${BASE_URL}/signup`)}
            ${p(`— Team Bitlance`)}
        `)
    },
    // Step 7 — Day 21
    {
        subject: `Last one from me (for now)`,
        preview: `If this is the right time, here's the link.`,
        html: (name) => emailLayout(`
            ${p(`Hey ${name || 'there'},`)}
            ${p(`I've sent a few emails about Meta Ads automation.`)}
            ${p(`If Bitlance is something you want to try, here's the link:`)}
            ${btn('Start Free', `${BASE_URL}/signup`)}
            ${p(`If the timing isn't right, no worries — I'll stop the emails here.`)}
            ${p(`If you have a specific question before signing up, reply and I'll answer it personally.`)}
            ${p(`— Team Bitlance`)}
        `)
    }
];

export const NURTURE_DELAYS = [0, 2, 5, 8, 10, 13, 17, 21];

// ── RE-ENGAGEMENT SEQUENCE (4 emails · 14 days) ──────────────────────────────
export const REENGAGEMENT_EMAIL_TEMPLATES = [
    // Step 0 — Trigger fires (30+ days inactive)
    {
        subject: `Still running Meta Ads?`,
        preview: `Checking in — not a sales email.`,
        html: (name) => emailLayout(`
            ${p(`Hey ${name || 'there'},`)}
            ${p(`You signed up for Bitlance a while back but haven't logged in recently.`)}
            ${p(`Just checking in — are you still running Meta Ads?`)}
            ${p(`If something stopped you from getting started, reply and tell me. I read these.`)}
            ${btn('Log Back In', `${BASE_URL}/home`)}
            ${p(`— Team Bitlance`)}
        `)
    },
    // Step 1 — Day 4
    {
        subject: `What's new in Bitlance since you last visited`,
        preview: `A few things worth knowing.`,
        html: (name) => emailLayout(`
            ${p(`Hey ${name || 'there'},`)}
            ${p(`Since you last logged in, we've been building. Here's what's worth knowing:`)}
            <ul style="font-size:15px;color:#333;line-height:2;padding-left:20px;margin:0 0 16px;">
              <li>AI content generation for ad creatives is now available</li>
              <li>Campaign scheduling is faster and more reliable</li>
              <li>CAPI integration is part of every campaign setup by default</li>
              <li>Lead sync to Google Sheets is live for lead gen campaigns</li>
            </ul>
            ${p(`Your account is still here. Pick up where you left off.`)}
            ${btn('Log Back In', `${BASE_URL}/home`)}
            ${p(`— Team Bitlance`)}
        `)
    },
    // Step 2 — Day 9
    {
        subject: `Here's a reason to come back`,
        preview: `We're extending your access — no catch.`,
        html: (name) => emailLayout(`
            ${p(`Hey ${name || 'there'},`)}
            ${p(`We want you to actually see what Bitlance can do — not just sign up and leave.`)}
            ${p(`Log back in and launch a campaign. If you get stuck, reply here and we'll walk you through it step by step.`)}
            ${btn('Log Back In', `${BASE_URL}/home`)}
            ${p(`No credit card required, no catch. Just log in and try it.`)}
            ${p(`— Team Bitlance`)}
        `)
    },
    // Step 3 — Day 14
    {
        subject: `Should I remove you from the list?`,
        preview: `Yes or no — either is fine.`,
        html: (name) => emailLayout(`
            ${p(`Hey ${name || 'there'},`)}
            ${p(`This is the last email I'll send unless you want to hear from us.`)}
            ${p(`If Meta Ads aren't something you're focused on right now, no problem — <a href="${BASE_URL}/unsubscribe" style="color:#26CECE;">unsubscribe here</a> and I won't bother you again.`)}
            ${p(`If you do want to pick it back up:`)}
            ${btn('Log Back In', `${BASE_URL}/home`)}
            ${p(`Either way — no hard feelings.`)}
            ${p(`— Team Bitlance`)}
        `)
    }
];

export const REENGAGEMENT_DELAYS = [0, 4, 9, 14];

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Remarketing reminder email — sent to leads who downloaded but haven't booked.
 * The CTA link pre-fills the booking form with their data.
 * @param {object} lead - The lead object from Supabase
 * @returns {string} HTML email content
 */
export const REMINDER_EMAIL_TEMPLATE = (lead) => {
    const bookingUrl = `https://www.bitlancetechhub.com/apply/audit?email=${encodeURIComponent(lead.email || '')}&name=${encodeURIComponent(lead.name || '')}&phoneno=${encodeURIComponent(lead.phone || '')}&lid=${lead.id || ''}`;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin:0; padding:0; background:#f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background:#fff; border-radius:8px; border-top: 4px solid #3b82f6; }
        h2 { color: #1e3a8a; }
        .btn { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); color: #fff !important; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; font-size: 15px; }
        .footer { margin-top: 30px; font-size: 12px; color: #888; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Hi ${lead.name || 'there'}, let's automate your growth.</h2>
        <p>I noticed you downloaded our automation guide recently.</p>
        <p>Reading the guide is a great first step — but if you want to skip the trial-and-error phase, we can show you exactly how this system applies to <strong>your specific business model</strong>.</p>
        <p>Let's hop on a quick <strong>15-minute strategy call</strong>. No sales pressure, just pure value.</p>

        <center>
            <a href="${bookingUrl}" class="btn">📅 Book Your Free Strategy Demo</a>
        </center>

        <p style="margin-top:24px;">Looking forward to speaking with you!</p>
        <p><strong>— The Bitlance Team</strong></p>

        <div class="footer">
            <p>You received this email because you opted in on our website.<br>
            <a href="#" style="color:#888;">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>
`;
};

