import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import ReactGA from 'react-ga4';
import { trackAgentOpen } from './lib/analytics';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ShapeHeroDemo from './pages/ShapeHeroDemo';
import LandingPage from './pages/LandingPage';

// ... existing imports


import AgentsPage from './pages/AgentsPage';
import BroadcastPage from './pages/BroadcastPage';
import SalesDashboard from './pages/SalesDashboard';
import SocialDashboard from './pages/SocialDashboard';
import SeoAgentPage from './pages/SeoAgentPage';
import BlogPage from './pages/BlogPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminDashboard from './pages/AdminDashboard';
import ClientHistoryPage from './pages/ClientHistoryPage';
import GraphicDesignerPage from './pages/GraphicDesignerPage';
// import MetaAdsPage from './pages/MetaAdsPage'; // replaced by multipage layout
import MetaAdsLayout from './pages/meta/MetaAdsLayout';
import MetaOverviewPage from './pages/meta/MetaOverviewPage';
import MetaCampaignsPage from './pages/meta/MetaCampaignsPage';
import MetaScheduledPostsPage from './pages/meta/MetaScheduledPostsPage';
import MetaInternalCampaignsPage from './pages/meta/MetaInternalCampaignsPage';
import MetaSettingsPage from './pages/meta/MetaSettingsPage';
import CampaignManagerPage from './pages/CampaignManagerPage';
// Landing Pages
import AwarenessLanding from './pages/landing/AwarenessLanding';
import TrafficLanding from './pages/landing/TrafficLanding';
import LeadGenLanding from './pages/landing/LeadGenLanding';
import SalesLanding from './pages/landing/SalesLanding';
import OfferLanding from './pages/landing/OfferLanding';
import RealEstateLeadGen from './pages/landing/RealEstateLeadGen';
import CampaignWizard from './components/campaigns/CampaignWizard';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsPage from './pages/TermsPage';
import TestimonialDemo from './pages/TestimonialDemo';
import ThankYouPage from './pages/ThankYouPage';
import QuizLandingPage from './pages/QuizLandingPage';
import VoiceBotFeaturesPage from './pages/VoiceBotFeaturesPage';
import BlogAgentFeaturesPage from './pages/BlogAgentFeaturesPage';
import ContactPage from './pages/ContactPage';
import TextGeneratorPage from './pages/TextGeneratorPage';
import EmailGeneratorPage from './pages/EmailGeneratorPage';// ... existing imports



import HomePage from './pages/HomePage'; // Import HomePage
import PublicBlogListPage from './pages/PublicBlogListPage';
import PublicArticlePage from './pages/PublicArticlePage';
import PushNotificationPage from './pages/PushNotificationPage';
import DeviceTokensPage from './pages/DeviceTokensPage';
import BlogManagerPage from './pages/BlogManagerPage';
import BlogEditorPage from './pages/BlogEditorPage';


import CookieDemoPage from './pages/CookieDemoPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WorkspaceProvider } from './context/WorkspaceContext';
import AuthGuard from './components/auth/AuthGuard';
import AdminGuard from './components/admin/AdminGuard';
import { Toaster } from 'react-hot-toast';


import './index.css';

// Public Route wrapper that redirects to home if already logged in
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // Or a spinner

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return null; // Or a spinner

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return <LandingPage />;
};

// Initialize GA4 once (replace G-XXXXXXXXXX with your actual Measurement ID)
const GA_MEASUREMENT_ID = 'G-7WE6LY54CL';
ReactGA.initialize(GA_MEASUREMENT_ID);

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Track page views on every route change
  useEffect(() => {
    ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search });
  }, [location]);

  // Highlight "Free AI Audit" CTAs 5s after route change
  useEffect(() => {
    document.documentElement.classList.remove('audit-highlight');
    const t = window.setTimeout(() => {
      document.documentElement.classList.add('audit-highlight');
    }, 5000);
    return () => {
      window.clearTimeout(t);
      document.documentElement.classList.remove('audit-highlight');
    };
  }, [location.pathname, location.search]);

  const handleAgentSelect = (agent) => {
    trackAgentOpen(agent.title);
    if (agent.title === 'WhatsApp Broadcasting Automation') {
      navigate('/dashboard/agents/social');
    } else if (agent.title === 'AI Voice Agent') {
      navigate('/dashboard/agents/voice');
    } else if (agent.title === 'SEO AI Agent') {
      navigate('/dashboard/agents/seo');
    } else if (agent.title === 'Graphic Designer AI') {
      navigate('/dashboard/agents/design');
    } else if (agent.title === 'Meta Ads Automation AI') {
      navigate('/dashboard/agents/meta');
    }
  };

  // Normalize path: lowercase and remove trailing slash
  const normalizedPath = location.pathname.toLowerCase().replace(/\/$/, "");
  // Add home and other pages to dashboard layout (no public nav/footer)
  const isDashboard = normalizedPath.includes('dashboard') ||
    normalizedPath.includes('admin') ||
    normalizedPath.includes('settings') ||
    normalizedPath.includes('blog-manager') ||
    (normalizedPath.includes('blogs/new') || normalizedPath.includes('blogs/edit')) ||
    normalizedPath.includes('push') ||
    normalizedPath.startsWith('/l/') ||
    normalizedPath.includes('/apply/audit') ||
    normalizedPath.includes('/apply'); // Hide Main Nav for Landing Pages and Audit Funnel

  return (
    <ThemeProvider>
      <AuthProvider>
        <WorkspaceProvider>
        <Toaster position="top-right" reverseOrder={false} />
        <div className={isDashboard ? 'bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300' : 'bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300'}>


          {/* Temporary Debug Banner
          <div className="fixed top-0 left-0 bg-red-500 text-white z-[100] text-xs p-1">
            Path: {location.pathname} | isDashboard: {isDashboard.toString()}
          </div> 
          */}
          {!isDashboard && <Navbar />}
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-policy" element={<TermsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/text-generator" element={<TextGeneratorPage />} />
            <Route path="/email-generator" element={<EmailGeneratorPage />} />

            <Route path="/blogs" element={<PublicBlogListPage />} />

            <Route path="/blogs/:id" element={<PublicArticlePage />} />
            <Route path="/login" element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } />
            <Route path="/signup" element={
              <PublicRoute>
                <SignupPage />
              </PublicRoute>
            } />

            <Route path="/cookie-demo" element={<CookieDemoPage />} />

            {/* Push & Blog Routes */}
            <Route path="/push/send" element={
              <AuthGuard>
                <PushNotificationPage />
              </AuthGuard>
            } />

            <Route path="/home" element={
              <AuthGuard>
                <HomePage />
              </AuthGuard>
            } />
            <Route path="/agents" element={
              <AuthGuard>
                <AgentsPage onAgentSelect={handleAgentSelect} />
              </AuthGuard>
            } />
            <Route path="/dashboard/agents/social" element={
              <AuthGuard>
                <BroadcastPage />
              </AuthGuard>
            } />
            <Route path="/SocialDashboard" element={
              <AuthGuard>
                <SocialDashboard />
              </AuthGuard>
            } />
            <Route path="/dashboard/agents/voice" element={
              <AuthGuard>
                <SalesDashboard />
              </AuthGuard>
            } />
            <Route path="/dashboard/agents/seo" element={
              <AuthGuard>
                <SeoAgentPage />
              </AuthGuard>
            } />
            <Route path="/dashboard/agents/blog" element={
              <AuthGuard>
                <BlogPage />
              </AuthGuard>
            } />
            <Route path="/dashboard/agents/design" element={
              <AuthGuard>
                <GraphicDesignerPage />
              </AuthGuard>
            } />
            {/* Meta Ads — multipage layout */}
            <Route
              path="/dashboard/agents/meta"
              element={
                <AuthGuard>
                  <MetaAdsLayout />
                </AuthGuard>
              }
            >
              <Route index element={<MetaOverviewPage />} />
              <Route path="campaigns" element={<MetaCampaignsPage />} />
              <Route path="posts" element={<MetaScheduledPostsPage />} />
              <Route path="internal" element={<MetaInternalCampaignsPage />} />
              <Route path="settings" element={<MetaSettingsPage />} />
            </Route>
            <Route path="/settings" element={
              <AuthGuard>
                <SettingsPage />
              </AuthGuard>
            } />
            <Route path="/admin" element={
              // TODO: Add AdminGuard
              <AuthGuard>
                <AdminDashboard />
              </AuthGuard>
            } />
            <Route path="/admin/client/:id" element={
              <AuthGuard>
                <ClientHistoryPage />
              </AuthGuard>
            } />
            <Route path="/admin/campaigns" element={
              <AuthGuard>
                <CampaignManagerPage />
              </AuthGuard>
            } />
            <Route path="/admin/campaigns/new" element={
              <AuthGuard>
                <CampaignWizard />
              </AuthGuard>
            } />

            {/* Landing Page Routes (No Auth Guard) */}
            <Route path="/l/awareness/:campaignId" element={<AwarenessLanding />} />
            <Route path="/l/traffic/:campaignId" element={<TrafficLanding />} />
            <Route path="/l/leadgen/:campaignId" element={<LeadGenLanding />} />
            <Route path="/l/sales/:campaignId" element={<SalesLanding />} />
            <Route path="/l/offer/:campaignId" element={<OfferLanding />} />
            {/* General Lead Gen Custom Funnel */}
            <Route path="/apply/audit" element={<RealEstateLeadGen />} />
            <Route path="/apply" element={<QuizLandingPage />} />
            <Route path="/thank-you" element={<ThankYouPage />} />

            <Route path="/testimonial-demo" element={<TestimonialDemo />} />
            <Route path="/shape-demo" element={<ShapeHeroDemo />} />
            <Route path="/features/voice-bot" element={<VoiceBotFeaturesPage />} />
            <Route path="/features/blog-agent" element={<BlogAgentFeaturesPage />} />


            {/* Push & Blog Routes */}
            <Route path="/push/send" element={
              <AuthGuard>
                <PushNotificationPage />
              </AuthGuard>
            } />
            <Route path="/push/tokens" element={
              <AuthGuard>
                <DeviceTokensPage />
              </AuthGuard>
            } />


            <Route path="/blog-manager" element={
              <AuthGuard>
                <BlogManagerPage />
              </AuthGuard>
            } />
            <Route path="/blogs/new" element={
              <AuthGuard>
                <BlogEditorPage />
              </AuthGuard>
            } />
            <Route path="/blogs/edit/:id" element={
              <AuthGuard>
                <BlogEditorPage />
              </AuthGuard>
            } />
          </Routes>
          {!isDashboard && location.pathname !== '/' && <Footer />}

        </div>
        </WorkspaceProvider>
      </AuthProvider>
    </ThemeProvider >
  );
}

export default App;

