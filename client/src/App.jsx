import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import ReactGA from 'react-ga4';
import { trackAgentOpen } from './lib/analytics';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/layout/Navbar';
import SplashScreen from './components/layout/SplashScreen';
import Footer from './components/layout/Footer';
import ShapeHeroDemo from './pages/demos/ShapeHeroDemo';
import LandingPage from './pages/landing/LandingPage';
import SeoLandingPage from './pages/landing/SeoLandingPage';
import QuizLandingPage from './pages/landing/QuizLandingPage';
import ThankYouPage from './pages/landing/ThankYouPage';

import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import ClientHistoryPage from './pages/admin/ClientHistoryPage';
import CampaignManagerPage from './pages/admin/CampaignManagerPage';
import CampaignWizard from './components/campaigns/CampaignWizard';

import HomePage from './pages/dashboard/HomePage';
import SalesDashboard from './pages/dashboard/SalesDashboard';
import SocialDashboard from './pages/dashboard/SocialDashboard';
import AgentsPage from './pages/dashboard/AgentsPage';
import BroadcastPage from './pages/dashboard/BroadcastPage';
import SeoAgentPage from './pages/dashboard/SeoAgentPage';
import GraphicDesignerPage from './pages/dashboard/GraphicDesignerPage';
import MetaAdsPage from './pages/dashboard/MetaAdsPage';
import EmailAutomationPage from './pages/dashboard/EmailAutomationPage';

import BlogPage from './pages/blog/BlogPage';
import BlogManagerPage from './pages/blog/BlogManagerPage';
import BlogEditorPage from './pages/blog/BlogEditorPage';
import BlogAgentFeaturesPage from './pages/blog/BlogAgentFeaturesPage';
import PublicBlogListPage from './pages/blog/PublicBlogListPage';
import PublicArticlePage from './pages/blog/PublicArticlePage';

import SettingsPage from './pages/settings/SettingsPage';

import ContactPage from './pages/public/ContactPage';
import PrivacyPolicy from './pages/public/PrivacyPolicy';
import TermsPage from './pages/public/TermsPage';
import TextGeneratorPage from './pages/public/TextGeneratorPage';
import EmailGeneratorPage from './pages/public/EmailGeneratorPage';

import PushNotificationPage from './pages/push/PushNotificationPage';
import DeviceTokensPage from './pages/push/DeviceTokensPage';

import ESignPage from './pages/esign/ESignDemoPage';
import ESignCompletePage from './pages/esign/ESignCompletePage';
import DigiLockerCompletePage from './pages/esign/DigiLockerCompletePage';
import PaymentCompletePage from './pages/esign/PaymentCompletePage';

import VoiceBotFeaturesPage from './pages/features/VoiceBotFeaturesPage';
import TestimonialDemo from './pages/demos/TestimonialDemo';
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
      navigate('/dashboard/agents/whatsapp');
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
    normalizedPath.includes('/apply') || // Hide Main Nav for Landing Pages and Audit Funnel
    normalizedPath === '/seo'; // SEO landing has its own NavBar

  return (
    <ThemeProvider>
      <AuthProvider>
        <WorkspaceProvider>
          <Toaster position="top-right" reverseOrder={false} />
          <div className={isDashboard ? 'bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300' : 'bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300 pb-20 md:pb-0'}>
            {/* First-visit splash screen — hidden on dashboard/admin routes */}
            <SplashScreen />


            {/* Temporary Debug Banner
          <div className="fixed top-0 left-0 bg-red-500 text-white z-[100] text-xs p-1">
            Path: {location.pathname} | isDashboard: {isDashboard.toString()}
          </div> 
          */}
            {!isDashboard && <Navbar />}
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="/seo" element={<SeoLandingPage />} />
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

              <Route path="/esign" element={<ESignPage />} />
              <Route path="/esign-demo" element={<ESignPage />} />
              <Route path="/esign/complete" element={<ESignCompletePage />} />
              <Route path="/digilocker/complete" element={<DigiLockerCompletePage />} />
              <Route path="/payment/complete" element={<PaymentCompletePage />} />

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
                <AgentsPage onAgentSelect={handleAgentSelect} />
              } />
              <Route path="/dashboard/agents/whatsapp" element={
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
              <Route path="/dashboard/agents/meta" element={
                <AuthGuard>
                  <MetaAdsPage />
                </AuthGuard>
              } />
              <Route path="/dashboard/email-automation" element={
                <AuthGuard>
                  <EmailAutomationPage />
                </AuthGuard>
              } />
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
              <Route path="/admin/email-automation" element={
                <AuthGuard>
                  <EmailAutomationPage />
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

