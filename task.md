# Marketing Features Blueprint: Meta Ads Promotion Types Implementation

> **Comprehensive guide to implementing 9 Meta Ads-inspired promotion types directly on your website**

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Promotion Types](#promotion-types)
   - [Awareness Campaigns](#1-awareness-campaigns)
   - [Traffic Campaigns](#2-traffic-campaigns)
   - [Engagement Campaigns](#3-engagement-campaigns)
   - [Lead Generation](#4-lead-generation)
   - [Sales/Conversions](#5-salesconversions)
   - [App Promotion](#6-app-promotion)
   - [Local Business Promotions](#7-local-business-promotions)
   - [Remarketing/Retargeting](#8-remarketingretargeting)
   - [Offer & Event Promotions](#9-offer--event-promotions)
4. [Shared Infrastructure](#shared-infrastructure)
5. [MVP & Phased Roadmap](#mvp--phased-roadmap)
6. [Testing Strategy](#testing-strategy)
7. [Deployment & Monitoring](#deployment--monitoring)

---

## Executive Summary

This blueprint provides a comprehensive guide to implementing Meta Ads-inspired promotion features directly on your website. Each promotion type is designed to replicate core Meta advertising functionality while maintaining independence from external platforms.

**Key Benefits:**
- ✅ Direct control over user acquisition and engagement
- ✅ First-party data collection and attribution
- ✅ Reduced dependency on third-party ad platforms
- ✅ Customizable optimization algorithms
- ✅ Seamless user experience within your ecosystem

**Technology Stack:**
- **Frontend:** React/Next.js, TypeScript, TailwindCSS
- **Backend:** Node.js/Express or Python/FastAPI
- **Database:** PostgreSQL (primary), Redis (caching)
- **Analytics:** Mixpanel/Amplitude + Custom Event Pipeline
- **A/B Testing:** Optimizely or custom solution
- **CDN:** Cloudflare or AWS CloudFront

---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐│
│  │ Landing Pages│ │  Components  │ │  Analytics Tracker   ││
│  │   & Flows    │ │   Library    │ │   (Client-side)      ││
│  └──────────────┘ └──────────────┘ └──────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                         API Gateway                          │
│              (Rate Limiting, Auth, Routing)                  │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend Services                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐│
│  │  Campaign    │ │   Analytics  │ │  Personalization     ││
│  │   Manager    │ │   Service    │ │     Engine           ││
│  └──────────────┘ └──────────────┘ └──────────────────────┘│
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐│
│  │     User     │ │  Attribution │ │   A/B Testing        ││
│  │ Segmentation │ │    Engine    │ │    Service           ││
│  └──────────────┘ └──────────────┘ └──────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐│
│  │  PostgreSQL  │ │     Redis    │ │   Event Stream       ││
│  │  (Primary)   │ │   (Cache)    │ │   (Kafka/Kinesis)    ││
│  └──────────────┘ └──────────────┘ └──────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Core Data Models

```typescript
// User Profile
interface UserProfile {
  id: string;
  email: string;
  demographics: {
    age?: number;
    gender?: string;
    location?: Location;
  };
  behaviors: {
    pageViews: number;
    sessionCount: number;
    averageSessionDuration: number;
    lastActive: Date;
  };
  segments: string[];
  customAttributes: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Campaign
interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: 'draft' | 'active' | 'paused' | 'completed';
  objective: string;
  targeting: TargetingCriteria;
  creative: CreativeAssets;
  budget?: BudgetConfig;
  schedule: ScheduleConfig;
  optimization: OptimizationConfig;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Event Tracking
interface Event {
  id: string;
  userId?: string;
  sessionId: string;
  eventType: string;
  eventName: string;
  properties: Record<string, any>;
  campaignId?: string;
  timestamp: Date;
  source: string;
  deviceInfo: DeviceInfo;
}
```

---

## Promotion Types

## 1. Awareness Campaigns

### Definition & Use Cases

**Purpose:** Maximize reach and brand visibility among target audiences.

**Use Cases:**
- New product launches
- Brand repositioning  
- Market expansion
- Seasonal brand awareness
- Thought leadership establishment

### UI/UX Design

**Awareness Banner Component:**
```typescript
interface AwarenessBannerProps {
  campaign: Campaign;
  variant: 'hero' | 'sticky' | 'popup' | 'inline';
  creative: {
    headline: string;
    subheadline?: string;
    imageUrl: string;
    videoUrl?: string;
    backgroundColor?: string;
  };
  tracking: TrackingConfig;
  onImpression: () => void;
  onClose?: () => void;
}
```

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  [LOGO]                    [MENU]               │
├─────────────────────────────────────────────────┤
│         ┌─────────────────────────────┐         │
│         │    HERO IMAGE/VIDEO         │         │
│         │    + Brand Message          │         │
│         │    [Primary CTA]            │         │
│         └─────────────────────────────┘         │
│  ┌──────────────────────────────────────────┐  │
│  │  Social Proof / Trust Indicators         │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Data Model & Analytics

**Events to Track:**
```typescript
const AWARENESS_EVENTS = {
  BANNER_IMPRESSION: 'awareness_banner_impression',
  VIDEO_IMPRESSION: 'awareness_video_impression',
  BANNER_CLICK: 'awareness_banner_click',
  VIDEO_START: 'awareness_video_start',
  VIDEO_25_PERCENT: 'awareness_video_25_percent',
  VIDEO_50_PERCENT: 'awareness_video_50_percent',
  VIDEO_75_PERCENT: 'awareness_video_75_percent',
  VIDEO_COMPLETE: 'awareness_video_complete',
  SHARE_CLICK: 'awareness_share_click',
  SOCIAL_SHARE_COMPLETE: 'awareness_social_share_complete',
};
```

**KPIs:**
- **Reach:** Unique users exposed to campaign
- **Impressions:** Total times creative displayed
- **Frequency:** Average impressions per user
- **View Rate:** % viewable impressions (50% visible for 1s+)
- **Video Completion Rate:** % videos watched to completion
- **Brand Lift:** Survey-based or proxy metrics

**Database Schema:**
```sql
CREATE TABLE awareness_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    objective VARCHAR(100) DEFAULT 'brand_awareness',
    status VARCHAR(50) DEFAULT 'draft',
    targeting_config JSONB,
    creative_assets JSONB,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    max_impressions_per_user INTEGER DEFAULT 3,
    max_impressions_per_day INTEGER,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE campaign_impressions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES awareness_campaigns(id),
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(255),
    variant_id VARCHAR(100),
    placement VARCHAR(100),
    creative_type VARCHAR(50),
    was_viewable BOOLEAN DEFAULT FALSE,
    view_duration_ms INTEGER,
    viewport_percentage INTEGER,
    page_url TEXT,
    referrer TEXT,
    device_type VARCHAR(50),
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_campaign_user ON campaign_impressions(campaign_id, user_id);
CREATE INDEX idx_timestamp ON campaign_impressions(timestamp);
```

### Technical Implementation

**Backend API Endpoints:**
```typescript
POST   /api/v1/campaigns/awareness
GET    /api/v1/campaigns/awareness/:id
PUT    /api/v1/campaigns/awareness/:id
DELETE /api/v1/campaigns/awareness/:id
POST   /api/v1/campaigns/awareness/:id/activate
POST   /api/v1/campaigns/awareness/:id/pause
GET    /api/v1/campaigns/awareness/serve
POST   /api/v1/campaigns/awareness/impression
POST   /api/v1/campaigns/awareness/engagement
GET    /api/v1/campaigns/awareness/:id/analytics
GET    /api/v1/campaigns/awareness/:id/reach
```

**Campaign Serving Service:**
```typescript
class AwarenessCampaignService {
  async serveCampaign(
    userId: string,
    context: ServingContext
  ): Promise<Campaign | null> {
    // 1. Get eligible campaigns
    const eligibleCampaigns = await this.getEligibleCampaigns(userId, context);
    
    if (eligibleCampaigns.length === 0) return null;
    
    // 2. Check frequency caps
    const campaignsWithinCap = await this.filterByFrequencyCap(
      eligibleCampaigns,
      userId
    );
    
    // 3. Select campaign (weighted random or optimization)
    const selected = await this.selectCampaign(
      campaignsWithinCap,
      userId,
      context
    );
    
    // 4. Track impression
    await this.trackImpression(selected, userId, context);
    
    return selected;
  }
  
  private async getEligibleCampaigns(
    userId: string,
    context: ServingContext
  ): Promise<Campaign[]> {
    const user = await this.userService.getUser(userId);
    
    return await this.campaignRepository.find({
      status: 'active',
      startDate: { $lte: new Date() },
      $or: [
        { endDate: null },
        { endDate: { $gte: new Date() } }
      ],
      targeting: {
        $or: [
          { segments: { $in: user.segments } },
          { demographics: this.matchesDemographics(user) },
          { behaviors: this.matchesBehaviors(user) }
        ]
      }
    });
  }
}
```

**Frontend Component:**
```typescript
import React, { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { trackEvent } from '@/lib/analytics';

export const AwarenessBanner: React.FC<AwarenessBannerProps> = ({
  campaign,
  variant,
  creative,
  tracking,
  onImpression,
  onClose
}) => {
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false
  });
  
  const viewTimerRef = useRef<NodeJS.Timeout>();
  const impressionTrackedRef = useRef(false);
  
  useEffect(() => {
    if (inView && !impressionTrackedRef.current) {
      // Track viewable impression after 1 second
      viewTimerRef.current = setTimeout(() => {
        trackEvent('awareness_banner_impression', {
          campaignId: tracking.campaignId,
          impressionId: tracking.impressionId,
          variant,
          wasViewable: true
        });
        
        onImpression();
        impressionTrackedRef.current = true;
      }, 1000);
    } else if (!inView && viewTimerRef.current) {
      clearTimeout(viewTimerRef.current);
    }
    
    return () => {
      if (viewTimerRef.current) {
        clearTimeout(viewTimerRef.current);
      }
    };
  }, [inView]);
  
  return (
    <div ref={ref} className={`awareness-banner awareness-banner--${variant}`}>
      <div className="awareness-banner__content">
        <h2>{creative.headline}</h2>
        {creative.subheadline && <p>{creative.subheadline}</p>}
        {creative.videoUrl ? (
          <VideoPlayer
            src={creative.videoUrl}
            campaignId={tracking.campaignId}
          />
        ) : (
          <img src={creative.imageUrl} alt={creative.headline} />
        )}
      </div>
      {onClose && (
        <button onClick={onClose} aria-label="Close banner">×</button>
      )}
    </div>
  );
};
```

### Accessibility Considerations

- **ARIA Labels:** All interactive elements have descriptive labels
- **Keyboard Navigation:** All CTAs keyboard accessible
- **Screen Reader Support:** Alt text for images, video transcripts
- **Contrast Ratios:** WCAG AA standards (4.5:1 for text)
- **Motion Preferences:** Respect `prefers-reduced-motion`
- **Focus Management:** Proper focus for popup/modal variants

### Performance Considerations

- **Lazy Loading:** Load creative assets only when in viewport
- **Image Optimization:** WebP with JPEG fallback, responsive images
- **Video Optimization:** Adaptive bitrate streaming
- **CDN:** Serve static assets from CDN
- **Caching:** Cache campaign configurations (5-15 min TTL)
- **Bundle Size:** Code-split campaign components

### User Stories & Acceptance Criteria

**User Story 1: Brand Discovery**
- **As a** new visitor
- **I want to** see compelling brand content
- **So that** I understand the brand's value proposition

**Acceptance Criteria:**
- [ ] Banner displays within 2 seconds of page load
- [ ] Creative is viewable (50%+ visible for 1s+)
- [ ] Impression tracked only when viewability criteria met
- [ ] User can dismiss banner if variant allows
- [ ] Banner respects frequency cap (max 3/day)

### MVP Scope

**Phase 1: Core Features ✅**
- Banner component (hero, inline variants)
- Basic targeting (segments only)
- Impression tracking
- Click tracking
- Frequency capping
- Basic analytics dashboard

**Excluded from MVP ❌**
- Video campaigns
- Advanced targeting (behavioral, demographic)
- A/B testing
- Brand lift surveys
- Cross-device attribution

### Content Templates

**Template 1: Product Launch**
```typescript
const productLaunchTemplate = {
  headline: "Introducing [Product Name]",
  subheadline: "The future of [category] is here",
  cta: {
    text: "Learn More",
    url: "/products/new-launch"
  },
  creative: {
    type: "image",
    primaryImage: "hero-product.jpg",
    backgroundColor: "#f0f4f8"
  },
  targeting: {
    segments: ["early-adopters", "tech-enthusiasts"],
    excludeSegments: ["existing-customers"]
  }
};
```

**Template 2: Brand Story**
```typescript
const brandStoryTemplate = {
  headline: "Our Story",
  subheadline: "Building a better tomorrow, together",
  cta: {
    text: "Discover Our Mission",
    url: "/about"
  },
  creative: {
    type: "video",
    videoUrl: "brand-story.mp4",
    posterImage: "brand-story-poster.jpg"
  },
  targeting: {
    segments: ["all-users"],
    frequency: {
      maxImpressionsPerUser: 2,
      timePeriod: "7d"
    }
  }
};
```

---

## 2. Traffic Campaigns

### Definition & Use Cases

**Purpose:** Drive qualified visitors to specific pages or sections.

**Use Cases:**
- Blog content promotion
- Landing page optimization
- Product page traffic
- Resource downloads
- Webinar registrations

### UI/UX Design

**Traffic Promotion Card:**
```typescript
interface TrafficPromotionCardProps {
  campaign: Campaign;
  content: {
    title: string;
    description: string;
    thumbnailUrl: string;
    destination: string;
    badge?: string; // "New", "Trending", "Popular"
  };
  placement: 'sidebar' | 'inline' | 'recommendation';
  tracking: TrackingConfig;
  onNavigate: (destination: string) => void;
}
```

**Recommended Content Grid:**
```
┌─────────────────────────────────────────────────┐
│  You Might Also Like                            │
├─────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  [IMG]   │  │  [IMG]   │  │  [IMG]   │     │
│  │  Title   │  │  Title   │  │  Title   │     │
│  │  Desc    │  │  Desc    │  │  Desc    │     │
│  │  [CTA]   │  │  [CTA]   │  │  [CTA]   │     │
│  └──────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────┘
```

### Data Model & Analytics

**Events:**
```typescript
const TRAFFIC_EVENTS = {
  PROMOTION_IMPRESSION: 'traffic_promotion_impression',
  PROMOTION_CLICK: 'traffic_promotion_click',
  LANDING_PAGE_VIEW: 'traffic_landing_page_view',
  BOUNCE: 'traffic_bounce',
  TIME_ON_PAGE: 'traffic_time_on_page',
  SCROLL_DEPTH: 'traffic_scroll_depth',
  EXIT: 'traffic_exit',
};
```

**KPIs:**
- **Click-Through Rate (CTR):** Clicks / Impressions
- **Landing Page Views:** Total visits to destination
- **Bounce Rate:** Single-page sessions / Total sessions
- **Average Session Duration:** Time spent on site
- **Pages per Session:** Average pages viewed
- **Cost per Click (CPC):** Budget / Clicks
- **Quality Score:** Engagement-based relevance metric

**Database Schema:**
```sql
CREATE TABLE traffic_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    objective VARCHAR(100) DEFAULT 'traffic',
    status VARCHAR(50) DEFAULT 'draft',
    destination_url TEXT NOT NULL,
    destination_type VARCHAR(50),
    targeting_config JSONB,
    creative_assets JSONB,
    placements VARCHAR(50)[],
    optimization_goal VARCHAR(50) DEFAULT 'clicks',
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE traffic_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES traffic_campaigns(id),
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(255),
    source_url TEXT,
    destination_url TEXT,
    placement VARCHAR(100),
    position INTEGER,
    landed BOOLEAN DEFAULT FALSE,
    bounce BOOLEAN,
    session_duration_ms INTEGER,
    pages_viewed INTEGER,
    converted BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP DEFAULT NOW()
);
```

### Technical Implementation

**Recommendation Service:**
```typescript
class TrafficRecommendationService {
  async getRecommendations(
    userId: string,
    context: RecommendationContext,
    limit: number = 3
  ): Promise<TrafficPromotion[]> {
    const user = await this.userService.getUser(userId);
    const eligibleCampaigns = await this.getEligibleCampaigns(user, context);
    const scoredCampaigns = await this.scoreCampaigns(
      eligibleCampaigns,
      user,
      context
    );
    const selected = this.diversifySelection(scoredCampaigns, limit);
    await this.trackImpressions(selected, user, context);
    
    return selected.map(sc => this.formatPromotion(sc));
  }
  
  private async scoreCampaigns(
    campaigns: Campaign[],
    user: UserProfile,
    context: RecommendationContext
  ): Promise<ScoredCampaign[]> {
    return campaigns.map(campaign => {
      let score = 0;
      
      // Content relevance
      score += this.calculateRelevanceScore(campaign, user);
      
      // Historical CTR
      score += campaign.performance.ctr * 10;
      
      // Recency boost for new content
      const ageInDays = this.getAgeInDays(campaign.createdAt);
      if (ageInDays < 7) score += (7 - ageInDays) * 0.5;
      
      // Diversity penalty for similar content
      if (this.hasSeenSimilar(user, campaign)) score *= 0.5;
      
      return { campaign, score };
    }).sort((a, b) => b.score - a.score);
  }
}
```

**Frontend Component:**
```typescript
export const TrafficPromotionCard: React.FC<TrafficPromotionCardProps> = ({
  campaign,
  content,
  placement,
  tracking,
  onNavigate
}) => {
  const router = useRouter();
  
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    await trackEvent('traffic_promotion_click', {
      campaignId: campaign.id,
      destinationUrl: content.destination,
      placement,
      position: tracking.position
    });
    
    await fetch('/api/v1/campaigns/traffic/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignId: campaign.id,
        impressionId: tracking.impressionId,
        destinationUrl: content.destination
      })
    });
    
    onNavigate(content.destination);
    router.push(content.destination);
  };
  
  return (
    <a href={content.destination} onClick={handleClick}>
      <div className="traffic-promotion-card">
        <img src={content.thumbnailUrl} alt={content.title} loading="lazy" />
        {content.badge && <span className="badge">{content.badge}</span>}
        <h3>{content.title}</h3>
        <p>{content.description}</p>
        <div className="cta">Read More →</div>
      </div>
    </a>
  );
};
```

### MVP Scope

**Phase 1 ✅**
- Promotion card component
- Recommendation engine (basic scoring)
- Click tracking
- Landing page tracking
- Basic analytics (CTR, bounce rate)

**Excluded ❌**
- Advanced ML-based recommendations
- Multi-destination campaigns
- Dynamic creative optimization
- Cross-domain tracking

---

## 3. Engagement Campaigns

### Definition & Use Cases

**Purpose:** Drive meaningful interactions with content, features, or community.

**Use Cases:**
- Social media interactions (likes, shares, comments)
- Content engagement (video views, article reads)
- Feature adoption
- Community participation
- Event RSVPs

### UI/UX Design

**Engagement Widget:**
```typescript
interface EngagementWidgetProps {
  campaign: Campaign;
  engagementType: 'like' | 'share' | 'comment' | 'vote' | 'rsvp';
  content: {
    title: string;
    context?: string;
  };
  currentState?: {
    hasEngaged: boolean;
    engagementCount: number;
  };
  onEngage: (type: string, data: any) => void;
}
```

### Data Model & Analytics

**Events:**
```typescript
const ENGAGEMENT_EVENTS = {
  LIKE: 'engagement_like',
  UNLIKE: 'engagement_unlike',
  SHARE_OPEN: 'engagement_share_open',
  SHARE_COMPLETE: 'engagement_share_complete',
  COMMENT_START: 'engagement_comment_start',
  COMMENT_SUBMIT: 'engagement_comment_submit',
  POLL_VOTE: 'engagement_poll_vote',
  VIDEO_PLAY: 'engagement_video_play',
  VIDEO_COMPLETE: 'engagement_video_complete',
  EVENT_RSVP: 'engagement_event_rsvp',
};
```

**KPIs:**
- **Engagement Rate:** (Reactions + Comments + Shares) / Impressions
- **Reaction Rate:** Reactions / Impressions
- **Share Rate:** Shares / Impressions
- **Comment Rate:** Comments / Impressions
- **Video Completion Rate:** Completes / Plays
- **Amplification Factor:** Reach from shares / Original reach

**Database Schema:**
```sql
CREATE TABLE engagement_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    objective VARCHAR(100) DEFAULT 'engagement',
    content_id VARCHAR(255),
    content_type VARCHAR(50),
    content_url TEXT,
    engagement_types VARCHAR(50)[],
    targeting_config JSONB,
    creative_assets JSONB,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE engagement_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES engagement_campaigns(id),
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(255),
    action_type VARCHAR(50),
    content_id VARCHAR(255),
    action_data JSONB,
    source_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE TABLE social_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engagement_action_id UUID REFERENCES engagement_actions(id),
    campaign_id UUID REFERENCES engagement_campaigns(id),
    user_id UUID REFERENCES users(id),
    channel VARCHAR(50),
    content_id VARCHAR(255),
    share_url TEXT,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    timestamp TIMESTAMP DEFAULT NOW()
);
```

### MVP Scope

**Phase 1 ✅**
- Like/unlike functionality
- Social sharing (Facebook, Twitter, LinkedIn, Email, Copy Link)
- Share tracking
- Basic comment system
- Engagement analytics

**Excluded ❌**
- Comment threading/replies
- Comment moderation dashboard
- Multiple reaction types
- Poll/quiz widgets
- Live engagement metrics

---

## 4. Lead Generation

### Definition & Use Cases

**Purpose:** Capture qualified leads through forms, downloads, and gated content.

**Use Cases:**
- Newsletter signups
- Whitepaper/ebook downloads
- Webinar registrations
- Free trial signups
- Contact form submissions
- Demo requests

### UI/UX Design

**Lead Capture Form:**
```typescript
interface LeadCaptureFormProps {
  campaign: Campaign;
  formConfig: {
    fields: FormField[];
    submitButtonText: string;
    privacyPolicyUrl: string;
    successMessage: string;
    redirectUrl?: string;
  };
  prefillData?: Partial<LeadData>;
  onSubmit: (data: LeadData) => void;
  onSuccess: (leadId: string) => void;
}
```

**Form Layout:**
```
┌─────────────────────────────────────────────────┐
│  Download: [Resource Title]                     │
├─────────────────────────────────────────────────┤
│  Get instant access to our comprehensive guide  │
│  ┌─────────────────────────────────────────┐   │
│  │ First Name *              [_________]   │   │
│  │ Last Name *               [_________]   │   │
│  │ Email Address *           [_________]   │   │
│  │ Company Name              [_________]   │   │
│  │ Job Title                 [_________]   │   │
│  │ Phone Number (optional)   [_________]   │   │
│  │ ☐ I agree to receive updates           │   │
│  │ [Download Now]                          │   │
│  │ By submitting, you agree to our        │   │
│  │ Privacy Policy                          │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### Data Model & Analytics

**Events:**
```typescript
const LEAD_GEN_EVENTS = {
  FORM_VIEW: 'leadgen_form_view',
  FORM_START: 'leadgen_form_start',
  FIELD_INTERACT: 'leadgen_field_interact',
  FORM_ERROR: 'leadgen_form_error',
  FORM_SUBMIT: 'leadgen_form_submit',
  FORM_SUCCESS: 'leadgen_form_success',
  DOWNLOAD_START: 'leadgen_download_start',
};
```

**KPIs:**
- **Form View Rate:** Form views / Page views
- **Form Start Rate:** Form starts / Form views
- **Form Completion Rate:** Submissions / Form starts
- **Form Abandonment Rate:** (Starts - Submissions) / Starts
- **Cost per Lead (CPL):** Total spend / Total leads
- **Lead Quality Score:** Engagement-based scoring
- **Time to Complete:** Average form completion time

**Database Schema:**
```sql
CREATE TABLE leadgen_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    offer_type VARCHAR(50),
    offer_title VARCHAR(255),
    offer_description TEXT,
    offer_asset_url TEXT,
    form_id UUID REFERENCES lead_forms(id),
    thank_you_page_url TEXT,
    confirmation_email_template_id UUID,
    targeting_config JSONB,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE lead_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    fields JSONB NOT NULL,
    submit_button_text VARCHAR(100) DEFAULT 'Submit',
    privacy_policy_url TEXT,
    success_message TEXT,
    progressive_profiling BOOLEAN DEFAULT FALSE,
    enable_captcha BOOLEAN DEFAULT TRUE,
    theme_config JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES leadgen_campaigns(id),
    form_id UUID REFERENCES lead_forms(id),
    user_id UUID REFERENCES users(id),
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company VARCHAR(255),
    job_title VARCHAR(100),
    phone VARCHAR(50),
    custom_data JSONB,
    source_url TEXT,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    lead_score INTEGER DEFAULT 0,
    lead_grade VARCHAR(10),
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Technical Implementation

**Lead Capture Service:**
```typescript
class LeadCaptureService {
  async submitLead(
    campaignId: string,
    formId: string,
    formData: Record<string, any>,
    context: SubmissionContext
  ): Promise<LeadSubmissionResult> {
    // 1. Validate form data
    const form = await this.formRepository.findById(formId);
    const validationResult = await this.validateFormData(form, formData);
    
    if (!validationResult.isValid) {
      return { success: false, errors: validationResult.errors };
    }
    
    // 2. Check for duplicate leads
    const existingLead = await this.checkDuplicateLead(formData.email);
    
    if (existingLead) {
      await this.updateLead(existingLead.id, formData, context);
      return { success: true, leadId: existingLead.id, isNew: false };
    }
    
    // 3. Create new lead
    const lead = await this.createLead(campaignId, formId, formData, context);
    
    // 4. Score lead
    const score = await this.scoreLeadService.scoreLead(lead);
    await this.leadRepository.update(lead.id, {
      leadScore: score.score,
      leadGrade: score.grade
    });
    
    // 5. Trigger follow-up actions
    await this.triggerFollowUpActions(campaignId, lead);
    
    return {
      success: true,
      leadId: lead.id,
      isNew: true,
      downloadUrl: await this.generateDownloadUrl(campaignId, lead.id)
    };
  }
}
```

**Lead Scoring:**
```typescript
class LeadScoringService {
  async scoreLead(lead: Lead): Promise<LeadScore> {
    let score = 0;
    
    // Demographic scoring
    score += this.scoreDemographics(lead);
    
    // Firmographic scoring (company attributes)
    score += await this.scoreFirmographics(lead);
    
    // Behavioral scoring
    score += await this.scoreBehavior(lead);
    
    // Source scoring
    score += this.scoreSource(lead);
    
    const grade = this.calculateGrade(score);
    return { score, grade };
  }
  
  private scoreDemographics(lead: Lead): number {
    let score = 0;
    
    // Job title scoring
    if (lead.jobTitle) {
      const seniorTitles = ['ceo', 'cto', 'vp', 'director', 'head'];
      if (seniorTitles.some(t => lead.jobTitle.toLowerCase().includes(t))) {
        score += 15;
      }
    }
    
    // Complete profile bonus
    const completedFields = [
      lead.firstName, lead.lastName, lead.company, lead.jobTitle, lead.phone
    ].filter(Boolean).length;
    score += completedFields * 2;
    
    return score;
  }
  
  private calculateGrade(score: number): string {
    if (score >= 80) return 'A';
    if (score >= 60) return 'B';
    if (score >= 40) return 'C';
    return 'D';
  }
}
```

### MVP Scope

**Phase 1 ✅**
- Lead capture forms
- Basic field types (text, email, select)
- Form validation
- Lead storage
- Confirmation emails
- Download delivery
- Basic lead scoring

**Excluded ❌**
- Progressive profiling
- Multi-step forms
- Advanced field types
- CAPTCHA integration
- CRM sync
- Lead nurturing workflows

---

## 5. Sales/Conversions

### Definition & Use Cases

**Purpose:** Drive purchases, subscriptions, or other high-value conversion actions.

**Use Cases:**
- E-commerce product purchases
- SaaS subscription signups
- Service bookings/appointments
- Add-to-cart actions
- Checkout completions
- Upsell/cross-sell

### Data Model & Analytics

**Events:**
```typescript
const CONVERSION_EVENTS = {
  PRODUCT_VIEW: 'conversion_product_view',
  ADD_TO_CART: 'conversion_add_to_cart',
  REMOVE_FROM_CART: 'conversion_remove_from_cart',
  CHECKOUT_START: 'conversion_checkout_start',
  CHECKOUT_STEP: 'conversion_checkout_step',
  PURCHASE: 'conversion_purchase',
  UPSELL_IMPRESSION: 'conversion_upsell_impression',
  UPSELL_ACCEPT: 'conversion_upsell_accept',
};
```

**KPIs:**
- **Conversion Rate:** Purchases / Unique visitors
- **Add-to-Cart Rate:** Adds / Product views
- **Cart Abandonment Rate:** (Carts - Purchases) / Carts
- **Average Order Value (AOV):** Revenue / Orders
- **Revenue per Visitor (RPV):** Revenue / Visitors
- **Return on Ad Spend (ROAS):** Revenue / Spend
- **Cost per Acquisition (CPA):** Spend / Conversions

**Database Schema:**
```sql
CREATE TABLE conversion_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    product_ids TEXT[],
    category_ids TEXT[],
    discount_type VARCHAR(50),
    discount_value DECIMAL(10,2),
    promo_code VARCHAR(50),
    optimization_goal VARCHAR(50) DEFAULT 'purchase',
    target_roas DECIMAL(10,2),
    daily_budget DECIMAL(10,2),
    start_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE shopping_carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    subtotal DECIMAL(10,2),
    tax DECIMAL(10,2),
    shipping DECIMAL(10,2),
    total DECIMAL(10,2),
    source_campaign_id UUID REFERENCES conversion_campaigns(id),
    created_at TIMESTAMP DEFAULT NOW(),
    abandoned_at TIMESTAMP,
    converted_at TIMESTAMP
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    cart_id UUID REFERENCES shopping_carts(id),
    status VARCHAR(50) DEFAULT 'pending',
    subtotal DECIMAL(10,2),
    tax DECIMAL(10,2),
    shipping DECIMAL(10,2),
    total DECIMAL(10,2),
    payment_method VARCHAR(50),
    source_campaign_id UUID REFERENCES conversion_campaigns(id),
    attribution_data JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);
```

---

## 6-9. Additional Promotion Types

### 6. App Promotion
**Focus:** App installs, app opens, in-app purchases, deep linking

### 7. Local Business Promotions
**Focus:** Store visits, directions requests, local inventory, phone calls

### 8. Remarketing/Retargeting
**Focus:** Cart abandonment recovery, product viewers, past purchasers, win-back campaigns

**Database Schema:**
```sql
CREATE TABLE remarketing_audiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    rules JSONB NOT NULL,
    lookback_days INTEGER DEFAULT 30,
    exclude_converters BOOLEAN DEFAULT TRUE,
    member_count INTEGER DEFAULT 0,
    last_refreshed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE remarketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    audience_id UUID REFERENCES remarketing_audiences(id),
    use_dynamic_content BOOLEAN DEFAULT FALSE,
    incentive_type VARCHAR(50),
    incentive_value DECIMAL(10,2),
    max_impressions_per_user INTEGER DEFAULT 5,
    min_hours_between_impressions INTEGER DEFAULT 24,
    start_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 9. Offer & Event Promotions
**Focus:** Flash sales, holiday promotions, product launches, event RSVPs, seasonal campaigns

**Database Schema:**
```sql
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50),
    is_virtual BOOLEAN DEFAULT FALSE,
    location JSONB,
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    offer_type VARCHAR(50),
    discount_percentage DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE event_rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id),
    user_id UUID REFERENCES users(id),
    campaign_id UUID REFERENCES campaigns(id),
    status VARCHAR(50) DEFAULT 'confirmed',
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    attended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(event_id, email)
);
```

---

## Shared Infrastructure

### Universal Analytics Pipeline

```typescript
class AnalyticsService {
  async trackEvent(
    eventName: string,
    properties: Record<string, any>,
    userId?: string
  ): Promise<void> {
    const event: Event = {
      id: generateId(),
      userId,
      sessionId: this.getSessionId(),
      eventType: this.categorizeEvent(eventName),
      eventName,
      properties,
      timestamp: new Date(),
      source: 'web',
      deviceInfo: this.getDeviceInfo()
    };
    
    await this.eventRepository.create(event);
    await this.realtimeAnalytics.send(event);
    await this.integrationService.sendEvent(event);
  }
}
```

### Attribution Engine

```typescript
class AttributionService {
  async attributeConversion(
    conversion: Conversion,
    attributionModel: AttributionModel = 'last_touch'
  ): Promise<AttributionResult> {
    const touchpoints = await this.getTouchpoints(
      conversion.userId,
      conversion.timestamp
    );
    
    const attributedTouchpoints = this.applyAttributionModel(
      touchpoints,
      attributionModel,
      conversion.value
    );
    
    await this.storeAttribution(conversion.id, attributedTouchpoints);
    
    return {
      conversionId: conversion.id,
      touchpoints: attributedTouchpoints,
      model: attributionModel
    };
  }
  
  private linearAttribution(
    touchpoints: Touchpoint[],
    value: number
  ): AttributedTouchpoint[] {
    const creditPerTouchpoint = value / touchpoints.length;
    return touchpoints.map(tp => ({
      ...tp,
      attributedValue: creditPerTouchpoint,
      attributionWeight: 1 / touchpoints.length
    }));
  }
  
  private timeDecayAttribution(
    touchpoints: Touchpoint[],
    value: number
  ): AttributedTouchpoint[] {
    const halfLife = 7; // days
    const weights = touchpoints.map(tp => {
      const daysSince = (Date.now() - tp.timestamp.getTime()) / 86400000;
      return Math.pow(0.5, daysSince / halfLife);
    });
    
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    return touchpoints.map((tp, i) => ({
      ...tp,
      attributedValue: value * (weights[i] / totalWeight),
      attributionWeight: weights[i] / totalWeight
    }));
  }
}
```

### User Segmentation Engine

```typescript
class SegmentationService {
  async evaluateSegments(userId: string): Promise<string[]> {
    const user = await this.userService.getUser(userId);
    const segments: string[] = [];
    
    // Demographic segments
    if (user.demographics.age >= 18 && user.demographics.age <= 24) {
      segments.push('gen_z');
    }
    
    // Behavioral segments
    const engagementScore = await this.calculateEngagementScore(userId);
    if (engagementScore > 80) segments.push('highly_engaged');
    else if (engagementScore < 20) segments.push('at_risk');
    
    // Purchase segments
    const purchaseHistory = await this.getPurchaseHistory(userId);
    if (purchaseHistory.totalPurchases > 0) {
      segments.push('customer');
      if (purchaseHistory.totalPurchases > 5) segments.push('loyal_customer');
      if (purchaseHistory.averageOrderValue > 100) {
        segments.push('high_value_customer');
      }
    } else {
      segments.push('prospect');
    }
    
    // Recency segments
    const daysSinceLastVisit = this.getDaysSinceLastVisit(
      user.behaviors.lastActive
    );
    if (daysSinceLastVisit > 30) segments.push('inactive');
    else if (daysSinceLastVisit < 7) segments.push('active');
    
    await this.userService.updateSegments(userId, segments);
    return segments;
  }
}
```

---

## MVP & Phased Roadmap

### MVP (Months 1-3): Foundation

**Objectives:**
- Launch 3 core promotion types
- Establish basic analytics infrastructure
- Validate product-market fit

**Included Features:**
✅ **Awareness Campaigns**
  - Banner components (hero, inline)
  - Basic targeting (segments)
  - Impression & click tracking
  - Frequency capping

✅ **Traffic Campaigns**
  - Recommendation engine
  - Content promotion cards
  - Click-through tracking
  - Landing page analytics

✅ **Lead Generation**
  - Lead capture forms
  - Form analytics
  - Email delivery
  - Basic lead scoring

**Infrastructure:**
✅ Event tracking system
✅ Campaign management API
✅ Basic analytics dashboard
✅ User segmentation (simple rules)
✅ PostgreSQL + Redis setup

**Success Metrics:**
- 1000+ campaigns created
- 10,000+ conversions tracked
- 90%+ system uptime
- <200ms API response time

---

### Phase 2 (Months 4-6): Growth

**Objectives:**
- Add conversion-focused features
- Implement advanced targeting
- Build A/B testing framework

**New Features:**
✅ Sales/Conversions
✅ Engagement Campaigns
✅ Remarketing

**Enhanced Infrastructure:**
✅ A/B testing framework
✅ Advanced attribution (multi-touch)
✅ Behavioral segmentation
✅ Real-time personalization
✅ Automated audience refresh

**Success Metrics:**
- 20%+ increase in conversion rate
- 50%+ cart abandonment recovery
- 3x ROAS on remarketing

---

### Phase 3 (Months 7-9): Optimization

**Objectives:**
- ML-powered optimization
- Advanced analytics
- Cross-channel integration

**New Features:**
✅ App Promotion
✅ Local Business Promotions
✅ Offer & Event Promotions

**ML & Optimization:**
✅ Predictive targeting
✅ Automated bid optimization
✅ Content personalization
✅ Churn prediction
✅ LTV forecasting

**Success Metrics:**
- 30%+ improvement in targeting accuracy
- 40%+ reduction in CPA
- 5x ROI on ML initiatives

---

## Testing Strategy

### Unit Testing
```typescript
describe('CampaignService', () => {
  it('should create campaign with valid data', async () => {
    const result = await service.createCampaign(campaignData);
    expect(result.id).toBeDefined();
  });
  
  it('should validate required fields', async () => {
    await expect(service.createCampaign({ name: '' }))
      .rejects.toThrow('Campaign name is required');
  });
  
  it('should respect frequency caps', async () => {
    // Test implementation
  });
});
```

### Integration Testing
```typescript
describe('Campaign API Integration', () => {
  it('should create and serve awareness campaign', async () => {
    // 1. Create campaign
    const createResponse = await request(app)
      .post('/api/v1/campaigns/awareness')
      .send(campaignData)
      .expect(201);
    
    // 2. Activate campaign
    await request(app)
      .post(`/api/v1/campaigns/awareness/${id}/activate`)
      .expect(200);
    
    // 3. Serve to eligible user
    const serveResponse = await request(app)
      .get('/api/v1/campaigns/awareness/serve')
      .expect(200);
    
    expect(serveResponse.body.campaign.id).toBe(id);
  });
});
```

### E2E Testing
```typescript
test('complete user journey', async ({ page }) => {
  await page.goto('https://example.com');
  
  const banner = await page.waitForSelector('.awareness-banner');
  expect(banner).toBeTruthy();
  
  await banner.click();
  await page.waitForURL('**/destination-page');
  
  const events = await page.evaluate(() => window.analyticsEvents);
  expect(events).toContainEqual(
    expect.objectContaining({ eventName: 'awareness_banner_click' })
  );
});
```

---

## Deployment & Monitoring

### Deployment Strategy

**Blue-Green Deployment:**
```yaml
version: '3.8'
services:
  app-blue:
    image: marketing-platform:${VERSION}
    environment:
      - COLOR=blue
    ports:
      - "3000:3000"
  
  app-green:
    image: marketing-platform:${VERSION}
    environment:
      - COLOR=green
    ports:
      - "3001:3000"
  
  load-balancer:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
```

**Deployment Checklist:**
- [ ] Run all tests (unit, integration, e2e)
- [ ] Database migrations applied
- [ ] Feature flags configured
- [ ] Monitoring dashboards ready
- [ ] Rollback plan documented
- [ ] Canary deployment to 5% traffic
- [ ] Monitor error rates for 30 min
- [ ] Gradual rollout to 100%

### Monitoring & Observability

**Key Metrics:**

1. **Application Health**
   - Request rate (req/s)
   - Error rate (%)
   - Response time (p50, p95, p99)
   - Uptime (%)

2. **Campaign Performance**
   - Active campaigns
   - Impressions/second
   - Conversion rate
   - Attribution accuracy

3. **System Resources**
   - CPU utilization
   - Memory usage
   - Database connections
   - Cache hit rate

**Alerting Rules:**
```yaml
groups:
  - name: marketing_platform
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
      
      - alert: SlowResponseTime
        expr: histogram_quantile(0.95, http_request_duration_seconds) > 1
        for: 10m
      
      - alert: LowCampaignServeRate
        expr: rate(campaigns_served_total[5m]) < 10
        for: 15m
```

**Structured Logging:**
```typescript
logger.info('Campaign served', {
  campaignId: '123',
  userId: 'user456',
  placement: 'homepage',
  latency: 45
});

logger.error('Campaign serving failed', {
  campaignId: '123',
  error: error.message,
  stack: error.stack
});
```

---

## Performance Benchmarks

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| API Response Time (p95) | <200ms | <500ms | >500ms |
| Campaign Serving | <100ms | <250ms | >250ms |
| Page Load Time | <2s | <4s | >4s |
| Database Query | <50ms | <100ms | >100ms |
| Cache Hit Rate | >90% | >70% | <70% |
| Error Rate | <0.1% | <1% | >1% |
| Uptime | >99.9% | >99% | <99% |

---

## Conclusion

This blueprint provides a comprehensive foundation for implementing Meta Ads-inspired promotion features on your website. The phased approach allows for iterative development while maintaining focus on core business objectives.

**Next Steps:**
1. ✅ Review and prioritize features based on business needs
2. ✅ Set up development environment and infrastructure
3. ✅ Begin MVP implementation (Awareness + Traffic + Lead Gen)
4. ✅ Establish testing and deployment pipelines
5. ✅ Launch MVP and gather user feedback
6. ✅ Iterate and expand to additional promotion types

**Key Success Factors:**
- Start small, iterate fast
- Measure everything
- Focus on user experience
- Maintain system performance
- Build for scale from day one

---

**Document Version:** 1.0  
**Last Updated:** February 7, 2026  
**Maintained By:** Marketing Engineering Team