import {
  Brain,
  Target,
  Share2,
  Video,
  Mic,
  Shield,
  Palette
} from 'lucide-react';

export const agents = [
  {
    icon: Brain,
    title: "SEO AI Agent",
    description: "Automates keyword research and content optimization.",
    features: [
      "Automated keyword research",
      "Content optimization",
      "SERP monitoring",
      "SEO audits"
    ],
    status: "Available"
  },
  {
    icon: Target,
    title: "Meta Ads Automation AI",
    description: "Automates AI-driven Facebook & Instagram campaign workflows.",
    features: [
      "Campaign creation",
      "Dynamic audience targeting",
      "Budget optimization",
      "Performance analytics"
    ],
    status: "Available"
  },
  {
    icon: Share2,
    title: "Social Media Automation",
    description: "Multi-platform AI content posting and scheduling.",
    features: [
      "Multi-platform posting",
      "AI content generation",
      "Scheduling optimization",
      "Engagement analytics"
    ],
    status: "Available"
  },
  {
    icon: Video,
    title: "UGC Video AI Agent",
    description: "AI-powered UGC video creation and editing for maximum engagement.",
    features: [
      "AI video editing",
      "UGC content",
      "Viral optimization",
      "Platform formatting"
    ],
    status: "Coming Soon"
  },
  {
    icon: Mic,
    title: "AI Voice Agent",
    description: "Automated phone calls and voice interactions with real-time analytics.",
    features: [
      "Inbound/Outbound calls",
      "Real-time transcription",
      "Sentiment analysis",
      "Call recording & logs"
    ],
    status: "Available"
  },
  {
    icon: Shield,
    title: "Security Audit AI",
    description: "Automated security scanning and vulnerability detection.",
    features: [
      "Vulnerability scanning",
      "Compliance checking",
      "Threat detection",
      "Security reports"
    ],
    status: "Disabled"
  },
  {
    icon: Palette,
    title: "Graphic Designer AI",
    description: "AI-powered real estate flyer generation with professional templates.",
    features: [
      "Flyer generation",
      "Template customization",
      "AI copywriting",
      "Multi-format export"
    ],
    status: "Available"
  }
];
