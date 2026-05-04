# Website Architecture - Automation Bitlance

## Overview

A full-stack Meta Ads automation platform with:
- **CampaignFactoryService** with Strategy Pattern for 9 promotion types
- **Scheduler Service** for automated campaign start/stop
- **Internal Webhooks** for Meta leads/conversions
- **Campaign Creation Wizard** (4-step React UI)
- **Meta Pixel + CAPI Integration** for server-side tracking

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (React + Vite)                          │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Public Routes           │  Protected Routes        │ Landing Pages │    │
│  │  ─────────────           │  ─────────────────       │ ────────────  │    │
│  │  /                       │  /home                   │ /l/awareness  │    │
│  │  /login                  │  /dashboard              │ /l/traffic    │    │
│  │  /signup                 │  /agents                 │ /l/leadgen    │    │
│  │  /blogs                  │  /meta-ads-agent         │ /l/sales      │    │
│  │  /blogs/:id              │  /admin/campaigns        │ /l/offer      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                       │
│                          ┌───────────▼───────────┐                          │
│                          │    Meta Pixel (fbq)   │                          │
│                          │  ID: 916142120954550  │                          │
│                          └───────────────────────┘                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       │ HTTPS
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SERVER (Node.js + Express)                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                            API Routes                               │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │  /api/auth/*           Authentication (Login, Signup, Logout)       │    │
│  │  /api/articles/*       Blog/Article CRUD                            │    │
│  │  /api/credits/*        Credit System Management                     │    │
│  │  /api/campaigns/*      Campaign CRUD + Media Upload                 │    │
│  │  /api/track/*          Event Tracking (CAPI Integration)            │    │
│  │  /api/meta/*           Meta Ads API (OAuth, Pages, Insights)        │    │
│  │  /api/design/*         AI Graphic Generation                        │    │
│  │  /api/admin/*          Admin Operations                             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                       │
│                    ┌─────────────────┼─────────────────┐                    │
│                    ▼                 ▼                 ▼                    │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐      │
│  │   MetaService    │  │ TrackingController│  │  CampaignController │      │
│  │  (Graph API)     │  │  (SHA-256 Hash)   │  │   (Supabase CRUD)   │      │
│  └────────┬─────────┘  └────────┬─────────┘  └──────────────────────┘      │
│           │                     │                                           │
└───────────┼─────────────────────┼───────────────────────────────────────────┘
            │                     │
            ▼                     ▼
┌───────────────────────┐  ┌───────────────────────────────────────────────────┐
│    Meta Graph API     │  │                   SUPABASE                        │
│  ──────────────────── │  │  ┌─────────────────────────────────────────────┐  │
│  • Conversion API     │  │  │  PostgreSQL Database                        │  │
│  • Marketing API      │  │  ├─────────────────────────────────────────────┤  │
│  • Pages API          │  │  │  • users                                    │  │
│  • OAuth 2.0          │  │  │  • awareness_campaigns                      │  │
└───────────────────────┘  │  │  • traffic_campaigns                        │  │
                           │  │  • engagement_campaigns                     │  │
                           │  │  • leadgen_campaigns                        │  │
                           │  │  • conversion_campaigns                     │  │
                           │  │  • app_promotion_campaigns                  │  │
                           │  │  • local_business_campaigns                 │  │
                           │  │  • remarketing_campaigns                    │  │
                           │  │  • offer_event_campaigns                    │  │
                           │  │  • tracking_events                          │  │
                           │  │  • articles                                 │  │
                           │  │  • credit_ledger                            │  │
                           │  │  • meta_connections                         │  │
                           │  └─────────────────────────────────────────────┘  │
                           │  ┌─────────────────────────────────────────────┐  │
                           │  │  Supabase Storage                           │  │
                           │  ├─────────────────────────────────────────────┤  │
                           │  │  • campaign-media (images, videos)          │  │
                           │  │  • post-media (social media assets)         │  │
                           │  └─────────────────────────────────────────────┘  │
                           └───────────────────────────────────────────────────┘
```

---

## 📁 Folder Structure

### Client (Frontend)

```
client/
├── index.html                    # Entry HTML with Meta Pixel
├── src/
│   ├── main.jsx                  # React entry point
│   ├── App.jsx                   # Main router component
│   ├── index.css                 # Global styles
│   │
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── AuthGuard.jsx         # Protected route wrapper
│   │   ├── AdminGuard.jsx
│   │   └── campaigns/
│   │       └── CampaignForms.jsx # All 9 campaign type forms
│   │
│   ├── context/
│   │   ├── AuthContext.jsx       # User authentication state
│   │   └── ThemeContext.jsx      # Dark/Light mode
│   │
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   ├── SalesDashboard.jsx
│   │   ├── MetaAdsPage.jsx       # Meta Ads management UI
│   │   ├── CampaignManagerPage.jsx
│   │   ├── AdminDashboard.jsx
│   │   └── landing/              # Ad Landing Pages
│   │       ├── LandingLayout.jsx
│   │       ├── AwarenessLanding.jsx
│   │       ├── TrafficLanding.jsx
│   │       ├── LeadGenLanding.jsx
│   │       ├── SalesLanding.jsx
│   │       └── OfferLanding.jsx
│   │
│   ├── utils/
│   │   └── MetaPixel.js          # Pixel tracking utility
│   │
│   └── services/
│       └── api.js                # API client
│
└── vite.config.js
```

### Server (Backend)

```
server/
├── src/
│   ├── index.js                  # Express app entry
│   │
│   ├── config/
│   │   └── supabaseClient.js     # Supabase connection
│   │
│   ├── controllers/
│   │   ├── campaignController.js
│   │   ├── trackingController.js # Event hashing & CAPI
│   │   └── ...
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── campaignRoutes.js     # + /upload endpoint
│   │   ├── trackingRoutes.js     # CAPI relay
│   │   ├── metaRoutes.js         # OAuth, Pages, Posts
│   │   └── ...
│   │
│   ├── services/
│   │   ├── metaService.js        # Graph API wrapper
│   │   ├── analyticsService.js
│   │   └── scheduler.js          # Post scheduling
│   │
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   └── utils/
│       └── encryption.js         # Data encryption
│
├── migrations/                   # SQL migrations
└── scripts/
    └── verify-tracking.js
```

---

## 🔄 Data Flow

### 1. User Visit → Meta Pixel PageView

```
User visits /l/leadgen/123
       │
       ▼
┌──────────────────┐
│   index.html     │ ─── fbq('track', 'PageView') ──► Meta Pixel
│   React App      │
└──────────────────┘
       │
       ▼
LeadGenLanding.jsx
       │
       ├── MetaPixel.track('ViewContent', {...})
       │         │
       │         ├──► Browser: fbq('track', 'ViewContent')
       │         └──► Server: POST /api/track
       │                        │
       │                        ▼
       │              ┌──────────────────┐
       │              │trackingController│
       │              │  • Hash PII      │
       │              │  • Store in DB   │
       │              │  • Send to CAPI  │
       │              └──────────────────┘
       │
       ▼
   User submits lead form
       │
       ├── MetaPixel.track('Lead', {...}, {email, phone})
       │         │
       │         ├──► Browser: fbq('track', 'Lead')
       │         └──► Server: POST /api/track (hashed)
       │                        │
       │                        ▼
       │              Meta Conversion API
       │              (Server-side, deduplicated)
```

### 2. Campaign Creation Flow

```
Admin clicks "Create Campaign"
       │
       ▼
CampaignManagerPage.jsx
       │
       ├── Select campaign type (e.g., "leadgen")
       │
       ▼
LeadGenForm (from CampaignForms.jsx)
       │
       ├── Fill details: Name, Headline, Description
       │
       ├── Upload Image/Video
       │       │
       │       ▼
       │   POST /api/campaigns/upload
       │       │
       │       ▼
       │   Supabase Storage (campaign-media bucket)
       │       │
       │       ▼
       │   Returns public URL
       │
       ▼
   Submit Form
       │
       ▼
   POST /api/campaigns
       │
       ▼
   campaignController.createCampaign()
       │
       ▼
   Supabase: INSERT INTO leadgen_campaigns
```

---

## 🎯 Campaign Types & Tables

| Type           | Table Name               | Key Fields                         |
|----------------|--------------------------|-------------------------------------|
| Awareness      | awareness_campaigns      | creative_assets, impressions_goal  |
| Traffic        | traffic_campaigns        | destination_url, click_goal        |
| Engagement     | engagement_campaigns     | engagement_type, target_actions    |
| Lead Gen       | leadgen_campaigns        | lead_form_type, lead_count_goal    |
| Conversion     | conversion_campaigns     | conversion_event, catalog_id       |
| App Promotion  | app_promotion_campaigns  | app_name, app_store_url            |
| Local Business | local_business_campaigns | address, radius_km, cta_type       |
| Remarketing    | remarketing_campaigns    | audience_source, lookback_days     |
| Offer/Event    | offer_event_campaigns    | offer_title, offer_details, subtype|

---

## 🔐 Environment Variables

### Server (.env)

```env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx

# Meta
META_APP_ID=xxx
META_APP_SECRET=xxx
META_REDIRECT_URI=http://localhost:3001/api/meta/oauth/callback
META_PIXEL_ID=916142120954550
META_ACCESS_TOKEN=xxx  # For CAPI

# Encryption
ENCRYPTION_KEY=xxx

# Server
PORT=3001
```

### Client (.env)

```env
VITE_API_URL=http://localhost:3001
```

---

## 📊 Tracking Events

| Event       | Trigger                       | Data Sent                      |
|-------------|-------------------------------|--------------------------------|
| PageView    | Every page load (auto)        | source_url                     |
| ViewContent | Landing page view             | content_name, content_ids      |
| Lead        | Form submission               | email (hashed), phone (hashed) |
| Purchase    | Checkout completion           | value, currency, content_ids   |
| AddToCart   | Cart button click             | content_type, value            |

---

## 🚀 API Endpoints Summary

### Public Endpoints
```
POST /api/track              # Event tracking (no auth)
POST /api/track/view         # Alias for PageView
POST /api/track/lead         # Alias for Lead
POST /api/track/purchase     # Alias for Purchase
GET  /api/public/articles    # Public blog list
GET  /api/public/articles/:id
```

### Protected Endpoints (require Bearer token)
```
POST   /api/auth/login
POST   /api/auth/signup
POST   /api/auth/logout

GET    /api/campaigns
POST   /api/campaigns
POST   /api/campaigns/upload  # File upload

GET    /api/meta/status
GET    /api/meta/pages
POST   /api/meta/posts
GET    /api/meta/campaigns/:adAccountId

GET    /api/credits/balance
POST   /api/design/generate
```

---

## 🔗 External Integrations

1. **Meta Graph API (v18.0)**
   - OAuth 2.0 for account connection
   - Pages API for post scheduling
   - Marketing API for campaign insights
   - Conversion API for server-side tracking

2. **Supabase**
   - PostgreSQL for all data storage
   - Auth for user management
   - Storage for media files
   - Realtime for live updates (future)

3. **AI Services (Optional)**
   - OpenAI for content generation
   - Vertex AI for graphic design
