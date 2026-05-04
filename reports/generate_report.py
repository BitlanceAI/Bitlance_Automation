from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor, white, black
import os, math

FONTS = r"C:\Users\rahul\.claude\skills\canvas-design\canvas-fonts"

def reg(name, file):
    pdfmetrics.registerFont(TTFont(name, os.path.join(FONTS, file)))

reg("IBMPlexMono",      "IBMPlexMono-Regular.ttf")
reg("IBMPlexMono-Bold", "IBMPlexMono-Bold.ttf")
reg("WorkSans",         "WorkSans-Regular.ttf")
reg("WorkSans-Bold",    "WorkSans-Bold.ttf")
reg("BigShoulders",     "BigShoulders-Bold.ttf")
reg("GeistMono",        "GeistMono-Regular.ttf")
reg("GeistMono-Bold",   "GeistMono-Bold.ttf")

TEAL    = HexColor("#26CECE")
DARK    = HexColor("#070707")
DARK2   = HexColor("#111111")
DARK3   = HexColor("#1A1A1A")
DARK4   = HexColor("#222222")
BORDER  = HexColor("#1E1E1E")
MUTED   = HexColor("#888888")
DIM     = HexColor("#444444")
SOFT    = HexColor("#CCCCCC")
WHITE   = HexColor("#EFEFEF")
TEAL_DIM = HexColor("#0D4444")
TEAL_BG  = HexColor("#0A2020")
RED_DIM  = HexColor("#3A1010")
RED_ACC  = HexColor("#EF4444")
AMBER    = HexColor("#F59E0B")

W, H = A4  # 595.27 x 841.89 pts

OUT = r"d:\automation-bitlance\reports\bitlance-seo-competitive-analysis.pdf"
c = canvas.Canvas(OUT, pagesize=A4)

# ─── helpers ─────────────────────────────────────────────────────────────────

def fill(col):   c.setFillColor(col)
def stroke(col): c.setStrokeColor(col)
def lw(w):       c.setLineWidth(w)

def rect(x, y, w, h, fill_col=None, stroke_col=None, line_w=0.5):
    if fill_col:
        c.setFillColor(fill_col)
        if stroke_col:
            c.setStrokeColor(stroke_col)
            c.setLineWidth(line_w)
            c.rect(x, y, w, h, fill=1, stroke=1)
        else:
            c.rect(x, y, w, h, fill=1, stroke=0)
    elif stroke_col:
        c.setStrokeColor(stroke_col)
        c.setLineWidth(line_w)
        c.rect(x, y, w, h, fill=0, stroke=1)

def hline(x1, x2, y, col=BORDER, w=0.5):
    c.setStrokeColor(col)
    c.setLineWidth(w)
    c.line(x1, y, x2, y)

def vline(x, y1, y2, col=BORDER, w=0.5):
    c.setStrokeColor(col)
    c.setLineWidth(w)
    c.line(x, y1, x, y2)

def text(txt, x, y, font="WorkSans", size=9, col=WHITE, align="left"):
    c.setFont(font, size)
    c.setFillColor(col)
    if align == "center":
        c.drawCentredString(x, y, txt)
    elif align == "right":
        c.drawRightString(x, y, txt)
    else:
        c.drawString(x, y, txt)

def dot(x, y, r=1.5, col=TEAL):
    c.setFillColor(col)
    c.circle(x, y, r, fill=1, stroke=0)

def teal_tag(x, y, label, w=None):
    tw = c.stringWidth(label, "IBMPlexMono", 6.5) + 8
    if w: tw = w
    rect(x, y - 1, tw, 10, fill_col=TEAL_BG, stroke_col=TEAL, line_w=0.4)
    text(label, x + tw/2, y + 2.5, "IBMPlexMono", 6.5, TEAL, "center")
    return tw

def bg():
    rect(0, 0, W, H, fill_col=DARK)

# ─── COVER PAGE ──────────────────────────────────────────────────────────────

bg()

# Grid dot field (top half)
for gx in range(14, int(W), 22):
    for gy in range(int(H*0.45), int(H)-10, 22):
        dot(gx, gy, 0.6, HexColor("#1A1A1A"))

# Teal accent strip — top edge
rect(0, H - 2, W, 2, fill_col=TEAL)

# Large geometric shape — teal quadrant top-right
path = c.beginPath()
path.moveTo(W*0.55, H)
path.lineTo(W, H)
path.lineTo(W, H*0.55)
path.close()
c.setFillColor(HexColor("#0D2E2E"))
c.drawPath(path, fill=1, stroke=0)

# Inner triangle teal outline
path2 = c.beginPath()
path2.moveTo(W*0.62, H)
path2.lineTo(W, H)
path2.lineTo(W, H*0.62)
path2.close()
c.setStrokeColor(TEAL)
c.setLineWidth(0.4)
c.drawPath(path2, fill=0, stroke=1)

# Horizontal scan lines across middle
for i, yy in enumerate(range(int(H*0.36), int(H*0.44), 7)):
    alpha_col = HexColor("#1E1E1E") if i % 2 == 0 else HexColor("#141414")
    rect(0, yy, W, 7, fill_col=alpha_col)

# Label top-left
text("BITLANCE INTELLIGENCE", 24, H - 18, "IBMPlexMono", 7, TEAL)
hline(24, 200, H - 22, TEAL, 0.4)

# Report type tag
teal_tag(24, H - 42, "COMPETITIVE ANALYSIS REPORT")

# Main title
c.setFont("BigShoulders", 44)
c.setFillColor(WHITE)
c.drawString(24, H*0.62, "SEO BLOGGING")
c.setFillColor(TEAL)
c.drawString(24, H*0.62 - 50, "COMPETITIVE")
c.setFillColor(HexColor("#333333"))
c.drawString(24, H*0.62 - 98, "LANDSCAPE")

# Subtitle rule
hline(24, W - 24, H*0.62 - 112, BORDER, 0.5)

text("WHERE BITLANCE STANDS · APRIL 2026", 24, H*0.62 - 126, "IBMPlexMono", 7.5, MUTED)

# Bottom meta bar
rect(0, 0, W, 36, fill_col=DARK2)
hline(0, W, 36, BORDER, 0.5)
text("BITLANCE PLATFORM", 24, 14, "IBMPlexMono", 7, MUTED)
text("INTERNAL STRATEGY DOCUMENT", W/2, 14, "IBMPlexMono", 7, DIM, "center")
text("2026.04", W - 24, 14, "IBMPlexMono", 7, MUTED, "right")

# Signal dots cluster — decorative
for i in range(5):
    dot(W - 30 - i*14, H*0.3, 1.2 + i*0.3, TEAL if i == 4 else HexColor("#1E3A3A"))

# Corner marks
for cx, cy in [(24, H-24), (W-24, H-24), (24, 50), (W-24, 50)]:
    c.setStrokeColor(TEAL)
    c.setLineWidth(0.5)
    if cx < W/2:
        c.line(cx, cy, cx+8, cy)
        c.line(cx, cy, cx, cy + (8 if cy > H/2 else -8))
    else:
        c.line(cx, cy, cx-8, cy)
        c.line(cx, cy, cx, cy + (8 if cy > H/2 else -8))

c.showPage()

# ─── PAGE 2 — EXECUTIVE SUMMARY ──────────────────────────────────────────────

bg()

# Top teal bar
rect(0, H - 2, W, 2, fill_col=TEAL)

# Section label
text("EXECUTIVE SUMMARY", 24, H - 22, "IBMPlexMono", 7, TEAL)
hline(24, W - 24, H - 28, TEAL, 0.4)
text("PAGE 02", W - 24, H - 22, "IBMPlexMono", 7, DIM, "right")

# Section header
c.setFont("BigShoulders", 28)
c.setFillColor(WHITE)
c.drawString(24, H - 58, "WHERE WE STAND")

hline(24, W - 24, H - 68, BORDER, 0.5)

# Lead paragraph
lead = [
    "Bitlance currently operates a functional auto-blog pipeline: cron scheduling,",
    "Google Sheets sync, and queue management. However, compared to 2026's",
    "leading AI SEO platforms, critical capabilities are absent — leaving significant",
    "organic growth and user retention value on the table.",
]
y = H - 90
for line in lead:
    text(line, 24, y, "WorkSans", 9.5, SOFT)
    y -= 14

# Market context box
y -= 12
rect(24, y - 52, W - 48, 58, fill_col=TEAL_BG, stroke_col=TEAL, line_w=0.5)
text("MARKET SIGNAL", 34, y - 8, "IBMPlexMono", 6.5, TEAL)
text("AI SEO tools market: $1.2B (2024) → $4.5B (2033)", 34, y - 22, "WorkSans-Bold", 9, WHITE)
text("60% of marketers are piloting or scaling AI in their content workflows as of 2026.", 34, y - 36, "WorkSans", 8.5, SOFT)
hline(34, W - 34, y - 43, TEAL, 0.3)
text("SOURCE: Market Research Reports 2026 · Semrush Industry Survey", 34, y - 50, "IBMPlexMono", 6, MUTED)

y -= 78

# Status table header
text("CURRENT BITLANCE CAPABILITIES", 24, y, "IBMPlexMono", 7, MUTED)
y -= 10
hline(24, W - 24, y, BORDER, 0.5)
y -= 18

capabilities = [
    ("Cron-based blog scheduling",     True,  "ACTIVE"),
    ("Google Sheets → Queue sync",     True,  "ACTIVE"),
    ("Blog queue management",          True,  "ACTIVE"),
    ("Built-in keyword research",      False, "MISSING"),
    ("External CMS auto-publish",      False, "MISSING"),
    ("SERP / ranking monitoring",      False, "MISSING"),
    ("AI citation tracking (GEO)",     False, "MISSING"),
    ("Real-time SEO content scoring",  False, "MISSING"),
    ("Backlink automation",            False, "MISSING"),
]

for cap, active, status in capabilities:
    col = TEAL if active else RED_ACC
    bg_col = TEAL_BG if active else RED_DIM
    status_w = 55
    rect(24, y - 3, W - 48, 16, fill_col=DARK2)
    hline(24, W - 24, y - 3, BORDER, 0.3)

    # Status pill
    rect(W - 24 - status_w, y, status_w - 6, 11, fill_col=bg_col)
    text(status, W - 24 - status_w + (status_w - 6)/2, y + 3, "IBMPlexMono", 6, col, "center")

    # Dot
    dot(36, y + 5.5, 2.5, col)
    text(cap, 46, y + 3, "WorkSans", 8.5, WHITE if active else SOFT)
    y -= 18

# Page footer
hline(24, W - 24, 30, BORDER, 0.4)
text("BITLANCE INTELLIGENCE · SEO COMPETITIVE ANALYSIS · APRIL 2026", 24, 18, "IBMPlexMono", 6, DIM)
text("02", W - 24, 18, "IBMPlexMono", 6, MUTED, "right")

c.showPage()

# ─── PAGE 3 — COMPETITOR LANDSCAPE ───────────────────────────────────────────

bg()
rect(0, H - 2, W, 2, fill_col=TEAL)
text("COMPETITOR LANDSCAPE", 24, H - 22, "IBMPlexMono", 7, TEAL)
hline(24, W - 24, H - 28, TEAL, 0.4)
text("PAGE 03", W - 24, H - 22, "IBMPlexMono", 7, DIM, "right")

c.setFont("BigShoulders", 28)
c.setFillColor(WHITE)
c.drawString(24, H - 58, "THE FIELD")

hline(24, W - 24, H - 68, BORDER, 0.5)

competitors = [
    {
        "name":     "RightBlogger",
        "strength": "Hands-free pipeline",
        "detail":   "Keyword → Write → Auto-publish to WordPress / Webflow / Shopify",
        "tags":     ["AUTO-PUBLISH", "KEYWORD RESEARCH", "CMS INTEGRATION"],
        "tier":     "HIGH",
    },
    {
        "name":     "Outrank",
        "strength": "Backlink network",
        "detail":   "Integrated backlink exchange + auto content creation at scale",
        "tags":     ["BACKLINKS", "AUTO CONTENT", "AUTHORITY BUILD"],
        "tier":     "HIGH",
    },
    {
        "name":     "Frase",
        "strength": "6-stage pipeline · ~$45/mo",
        "detail":   "Research → Write → Audit → Monitor → Auto-fix ranking drops",
        "tags":     ["RANK MONITORING", "AUTO-FIX", "CONTENT AUDIT"],
        "tier":     "HIGH",
    },
    {
        "name":     "Surfer SEO",
        "strength": "Real-time scoring",
        "detail":   "SERP analysis + live SEO score as you write — inline optimization",
        "tags":     ["SEO SCORING", "SERP ANALYSIS", "REAL-TIME"],
        "tier":     "MED",
    },
    {
        "name":     "BlogSEO AI",
        "strength": "Full automation",
        "detail":   "Keyword → Full article → Schedule → Auto-publish pipeline",
        "tags":     ["FULL PIPELINE", "AUTO-PUBLISH"],
        "tier":     "MED",
    },
    {
        "name":     "Sight AI",
        "strength": "AI citation tracking · $29+/mo",
        "detail":   "Tracks content cited by ChatGPT, Perplexity, Claude — GEO-optimized",
        "tags":     ["GEO", "AI CITATIONS", "CONTENT GAPS"],
        "tier":     "HIGH",
    },
    {
        "name":     "Arvow",
        "strength": "Autoblog pipeline",
        "detail":   "AI-driven autoblog with full auto-publishing workflow",
        "tags":     ["AUTO-PUBLISH", "AUTOBLOG"],
        "tier":     "MED",
    },
]

y = H - 90
card_h = 80
gap = 8

for i, comp in enumerate(competitors):
    tier_col = TEAL if comp["tier"] == "HIGH" else AMBER
    tier_bg  = TEAL_BG if comp["tier"] == "HIGH" else HexColor("#2A1F00")

    rect(24, y - card_h, W - 48, card_h, fill_col=DARK2, stroke_col=BORDER, line_w=0.4)

    # Left teal/amber bar
    rect(24, y - card_h, 3, card_h, fill_col=tier_col)

    # Number
    num_str = f"{i+1:02d}"
    c.setFont("GeistMono-Bold", 20)
    c.setFillColor(HexColor("#1A1A1A"))
    c.drawString(36, y - card_h + card_h/2 - 9, num_str)

    # Name + strength
    text(comp["name"], 70, y - 18, "WorkSans-Bold", 11, WHITE)
    text(comp["strength"], 70, y - 32, "IBMPlexMono", 7, tier_col)

    # Detail
    text(comp["detail"], 70, y - 48, "WorkSans", 8, SOFT)

    # Tags
    tx = 70
    for tag in comp["tags"]:
        tw = c.stringWidth(tag, "IBMPlexMono", 5.5) + 8
        rect(tx, y - card_h + 10, tw, 10, fill_col=tier_bg)
        text(tag, tx + tw/2, y - card_h + 13, "IBMPlexMono", 5.5, tier_col, "center")
        tx += tw + 4

    # Tier badge
    rect(W - 60, y - 20, 32, 13, fill_col=tier_bg)
    text(comp["tier"] + " THREAT", W - 60 + 16, y - 14, "IBMPlexMono", 5.5, tier_col, "center")

    y -= (card_h + gap)

# Footer
hline(24, W - 24, 30, BORDER, 0.4)
text("BITLANCE INTELLIGENCE · SEO COMPETITIVE ANALYSIS · APRIL 2026", 24, 18, "IBMPlexMono", 6, DIM)
text("03", W - 24, 18, "IBMPlexMono", 6, MUTED, "right")

c.showPage()

# ─── PAGE 4 — GAP ANALYSIS ───────────────────────────────────────────────────

bg()
rect(0, H - 2, W, 2, fill_col=TEAL)
text("GAP ANALYSIS", 24, H - 22, "IBMPlexMono", 7, TEAL)
hline(24, W - 24, H - 28, TEAL, 0.4)
text("PAGE 04", W - 24, H - 22, "IBMPlexMono", 7, DIM, "right")

c.setFont("BigShoulders", 28)
c.setFillColor(WHITE)
c.drawString(24, H - 58, "WHERE WE LAG")

hline(24, W - 24, H - 68, BORDER, 0.5)

text("CRITICAL FEATURE GAPS — RANKED BY IMPACT", 24, H - 84, "IBMPlexMono", 6.5, MUTED)

gaps = [
    {
        "rank":    "01",
        "title":   "No Built-in Keyword Research",
        "impact":  "CRITICAL",
        "detail":  "Competitors auto-discover topics from search trends. Bitlance requires manual Google Sheets input.\nUsers must bring their own keyword strategy — eliminating a core value-add.",
        "who":     "RightBlogger · BlogSEO AI · Sight AI",
    },
    {
        "rank":    "02",
        "title":   "No External CMS Auto-Publishing",
        "impact":  "CRITICAL",
        "detail":  "WordPress, Webflow, and Shopify integrations are standard. Bitlance blogs remain internal.\nNo path for users to publish to their own existing websites.",
        "who":     "RightBlogger · BlogSEO AI · Arvow",
    },
    {
        "rank":    "03",
        "title":   "No AI Citation Tracking (GEO)",
        "impact":  "HIGH",
        "detail":  "Sight AI tracks mentions across ChatGPT, Perplexity, Claude, Google AI Overviews.\nGenerative Engine Optimization is the 2026 differentiator — Bitlance has zero visibility here.",
        "who":     "Sight AI · Workfx AI · Otterly AI",
    },
    {
        "rank":    "04",
        "title":   "No SERP / Ranking Monitoring",
        "impact":  "HIGH",
        "detail":  "Frase detects ranking drops automatically and generates specific fix recommendations.\nBitlance publishes content with no feedback loop on whether it performs.",
        "who":     "Frase · Semrush · Surfer SEO",
    },
    {
        "rank":    "05",
        "title":   "No Real-Time SEO Content Scoring",
        "impact":  "HIGH",
        "detail":  "Surfer SEO scores content inline as you write, guiding optimization in real-time.\nThe Bitlance blog editor offers no feedback on keyword density, readability, or SEO quality.",
        "who":     "Surfer SEO · Frase · Scalenut",
    },
    {
        "rank":    "06",
        "title":   "No Backlink Automation",
        "impact":  "MED",
        "detail":  "Outrank builds backlinks automatically via an exchange network.\nBacklinks remain the #1 Google ranking factor — Bitlance has no mechanism here.",
        "who":     "Outrank · AirOps",
    },
]

y = H - 100
for gap in gaps:
    impact_col = RED_ACC if gap["impact"] == "CRITICAL" else (TEAL if gap["impact"] == "HIGH" else AMBER)
    impact_bg  = RED_DIM if gap["impact"] == "CRITICAL" else (TEAL_BG if gap["impact"] == "HIGH" else HexColor("#2A1F00"))

    h_card = 86
    rect(24, y - h_card, W - 48, h_card, fill_col=DARK2, stroke_col=BORDER, line_w=0.4)
    rect(24, y - h_card, 3, h_card, fill_col=impact_col)

    # Rank number
    c.setFont("GeistMono-Bold", 18)
    c.setFillColor(DIM)
    c.drawString(36, y - h_card/2 - 6, gap["rank"])

    # Impact badge
    bw = 58
    rect(W - 24 - bw, y - 20, bw - 6, 13, fill_col=impact_bg)
    text(gap["impact"], W - 24 - bw + (bw-6)/2, y - 14, "IBMPlexMono", 6, impact_col, "center")

    # Title
    text(gap["title"], 66, y - 16, "WorkSans-Bold", 10.5, WHITE)

    # Detail lines
    for li, dline in enumerate(gap["detail"].split("\n")):
        text(dline.strip(), 66, y - 30 - li*13, "WorkSans", 7.8, SOFT)

    # Competitors covering this
    text("COVERED BY:", 66, y - h_card + 14, "IBMPlexMono", 5.5, DIM)
    text(gap["who"], 66 + 52, y - h_card + 14, "IBMPlexMono", 5.5, MUTED)

    y -= (h_card + 6)

# Footer
hline(24, W - 24, 30, BORDER, 0.4)
text("BITLANCE INTELLIGENCE · SEO COMPETITIVE ANALYSIS · APRIL 2026", 24, 18, "IBMPlexMono", 6, DIM)
text("04", W - 24, 18, "IBMPlexMono", 6, MUTED, "right")

c.showPage()

# ─── PAGE 5 — RECOMMENDATIONS ────────────────────────────────────────────────

bg()
rect(0, H - 2, W, 2, fill_col=TEAL)
text("RECOMMENDATIONS", 24, H - 22, "IBMPlexMono", 7, TEAL)
hline(24, W - 24, H - 28, TEAL, 0.4)
text("PAGE 05", W - 24, H - 22, "IBMPlexMono", 7, DIM, "right")

c.setFont("BigShoulders", 28)
c.setFillColor(WHITE)
c.drawString(24, H - 58, "QUICK WINS")

hline(24, W - 24, H - 68, BORDER, 0.5)
text("PRIORITISED ACTION PLAN — RANKED BY EFFORT VS. IMPACT", 24, H - 82, "IBMPlexMono", 6.5, MUTED)

actions = [
    {
        "phase":  "PHASE 1",
        "effort": "LOW",
        "title":  "SEO Score Meter in Blog Editor",
        "detail": "Add real-time readability + keyword density scoring to BlogEditorPage.jsx.\nClose the gap with Surfer SEO's core differentiator with ~2–3 days of dev work.",
        "file":   "client/src/pages/BlogEditorPage.jsx",
        "impact": "HIGH",
    },
    {
        "phase":  "PHASE 1",
        "effort": "LOW",
        "title":  "Keyword Suggestions at Schedule Time",
        "detail": "Integrate DataForSEO or Google Search Console API at the schedule step.\nUsers get topic ideas — removes the Google Sheets dependency for keyword input.",
        "file":   "server/src/routes/autoBlogRoutes.js",
        "impact": "HIGH",
    },
    {
        "phase":  "PHASE 2",
        "effort": "MED",
        "title":  "WordPress / Webflow Auto-Publish Webhook",
        "detail": "Add an optional publish destination to auto-blog settings — POST to user's\nWordPress REST API or Webflow CMS API after generation. Unlocks external site use.",
        "file":   "server/src/routes/autoBlogRoutes.js",
        "impact": "HIGH",
    },
    {
        "phase":  "PHASE 2",
        "effort": "MED",
        "title":  "AI Citation Tracking (GEO Dashboard)",
        "detail": "Poll ChatGPT, Perplexity, Google AI Overviews for brand / article mentions.\nThe 2026 differentiator — no competitor in our tier has built this natively yet.",
        "file":   "server/src/controllers/ — new geoTracker.js",
        "impact": "CRITICAL",
    },
    {
        "phase":  "PHASE 3",
        "effort": "HIGH",
        "title":  "Backlink Outreach Automation",
        "detail": "Identify link prospects using Domain Authority signals + auto-send outreach\ne-mails via existing Twilio / email stack. Matches Outrank's core feature.",
        "file":   "server/src/services/ — new backlinkService.js",
        "impact": "HIGH",
    },
]

y = H - 98
for act in actions:
    effort_col = TEAL if act["effort"] == "LOW" else (AMBER if act["effort"] == "MED" else RED_ACC)
    effort_bg  = TEAL_BG if act["effort"] == "LOW" else (HexColor("#2A1F00") if act["effort"] == "MED" else RED_DIM)
    impact_col = RED_ACC if act["impact"] == "CRITICAL" else TEAL
    impact_bg  = RED_DIM if act["impact"] == "CRITICAL" else TEAL_BG

    h_card = 86
    rect(24, y - h_card, W - 48, h_card, fill_col=DARK2, stroke_col=BORDER, line_w=0.4)
    rect(24, y - h_card, 3, h_card, fill_col=effort_col)

    # Phase + effort badges
    teal_tag(66, y - 16, act["phase"])
    pw = c.stringWidth(act["phase"], "IBMPlexMono", 6.5) + 12
    rect(66 + pw + 4, y - 16 + (-1), 40, 10, fill_col=effort_bg)
    text(act["effort"] + " EFFORT", 66 + pw + 4 + 20, y - 16 + 2.5, "IBMPlexMono", 5.5, effort_col, "center")

    # Impact badge top-right
    bw = 62
    rect(W - 24 - bw, y - 18, bw - 6, 13, fill_col=impact_bg)
    text(act["impact"] + " IMPACT", W - 24 - bw + (bw-6)/2, y - 12, "IBMPlexMono", 5.5, impact_col, "center")

    # Title
    text(act["title"], 66, y - 32, "WorkSans-Bold", 10.5, WHITE)

    # Detail
    for li, dline in enumerate(act["detail"].split("\n")):
        text(dline.strip(), 66, y - 46 - li*12, "WorkSans", 7.8, SOFT)

    # File reference
    text("FILE:", 66, y - h_card + 14, "IBMPlexMono", 5.5, DIM)
    text(act["file"], 66 + 28, y - h_card + 14, "IBMPlexMono", 5.5, MUTED)

    y -= (h_card + 6)

# Footer
hline(24, W - 24, 30, BORDER, 0.4)
text("BITLANCE INTELLIGENCE · SEO COMPETITIVE ANALYSIS · APRIL 2026", 24, 18, "IBMPlexMono", 6, DIM)
text("05", W - 24, 18, "IBMPlexMono", 6, MUTED, "right")

c.showPage()

# ─── save ────────────────────────────────────────────────────────────────────
c.save()
print(f"PDF saved: {OUT}")
