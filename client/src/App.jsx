import React from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ShapeHeroDemo from './pages/ShapeHeroDemo';
import LandingPage from './pages/LandingPage';

// ... existing imports


import AgentsPage from './pages/AgentsPage';
import BroadcastPage from './pages/BroadcastPage';
import SalesDashboard from './pages/SalesDashboard';
import SeoAgentPage from './pages/SeoAgentPage';
import BlogPage from './pages/BlogPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminDashboard from './pages/AdminDashboard';
import ClientHistoryPage from './pages/ClientHistoryPage';
import GraphicDesignerPage from './pages/GraphicDesignerPage';
import MetaAdsPage from './pages/MetaAdsPage';
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



// ... existing imports



import HomePage from './pages/HomePage'; // Import HomePage
import PublicBlogListPage from './pages/PublicBlogListPage';
import PublicArticlePage from './pages/PublicArticlePage';
import PushNotificationPage from './pages/PushNotificationPage';
import DeviceTokensPage from './pages/DeviceTokensPage';
import BlogManagerPage from './pages/BlogManagerPage';
import BlogEditorPage from './pages/BlogEditorPage';


import CookieDemoPage from './pages/CookieDemoPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthGuard from './components/AuthGuard';
import AdminGuard from './components/AdminGuard';
import { Toaster } from 'react-hot-toast';
import NotificationPermission from './components/NotificationPermission';
import { CookieBanner } from './components/ui/cookie-banner';
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

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleAgentSelect = (agent) => {
    if (agent.title === 'Social Media Automation') {
      navigate('/broadcast');
    } else if (agent.title === 'AI Voice Agent') {
      navigate('/dashboard');
    } else if (agent.title === 'SEO AI Agent') {
      navigate('/seo-agent');
    } else if (agent.title === 'Graphic Designer AI') {
      navigate('/design-agent');
    } else if (agent.title === 'Meta Ads Automation AI') {
      navigate('/meta-ads-agent');
    }
  };

  // Normalize path: lowercase and remove trailing slash
  const normalizedPath = location.pathname.toLowerCase().replace(/\/$/, "");
  // Add home and other pages to dashboard layout (no public nav/footer)
  const isDashboard = normalizedPath.includes('dashboard') ||
    normalizedPath.includes('seo-agent') ||
    normalizedPath.includes('design-agent') ||
    (normalizedPath.includes('blog') && !normalizedPath.startsWith('/blogs')) ||
    normalizedPath.includes('settings') ||
    normalizedPath.includes('broadcast') ||
    normalizedPath.includes('broadcast') ||
    normalizedPath.includes('meta-ads-agent') ||
    normalizedPath.startsWith('/l/'); // Hide Main Nav for Landing Pages

  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster position="top-right" reverseOrder={false} />
        <div className={isDashboard ? 'bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300' : 'bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300'}>
          <NotificationPermission />
          <CookieBanner
            message="We use cookies to improve your experience. Allowing them helps us keep you updated with the latest blogs."
            acceptText="Allow & Subscribe"
            declineText="Decline"
          />
          {/* Temporary Debug Banner
          <div className="fixed top-0 left-0 bg-red-500 text-white z-[100] text-xs p-1">
            Path: {location.pathname} | isDashboard: {isDashboard.toString()}
          </div> 
          */}
          {!isDashboard && <Navbar />}
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsPage />} />

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
            <Route path="/broadcast" element={
              <AuthGuard>
                <BroadcastPage />
              </AuthGuard>
            } />
            <Route path="/dashboard" element={
              <AuthGuard>
                <SalesDashboard />
              </AuthGuard>
            } />
            <Route path="/seo-agent" element={
              <AuthGuard>
                <SeoAgentPage />
              </AuthGuard>
            } />
            <Route path="/blog" element={
              <AuthGuard>
                <BlogPage />
              </AuthGuard>
            } />
            <Route path="/design-agent" element={
              <AuthGuard>
                <GraphicDesignerPage />
              </AuthGuard>
            } />
            <Route path="/meta-ads-agent" element={
              <AuthGuard>
                <MetaAdsPage />
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
            {/* Real Estate Landing Custom Funnel */}
            <Route path="/apply/real-estate" element={<RealEstateLeadGen />} />
            <Route path="/testimonial-demo" element={<TestimonialDemo />} />
            <Route path="/shape-demo" element={<ShapeHeroDemo />} />


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


            <Route path="/blogs-manager" element={
              <AuthGuard>
                <BlogManagerPage />
              </AuthGuard>
            } />
            <Route path="/blog/new" element={
              <AuthGuard>
                <BlogEditorPage />
              </AuthGuard>
            } />
            <Route path="/blog/edit/:id" element={
              <AuthGuard>
                <BlogEditorPage />
              </AuthGuard>
            } />
          </Routes>
          {!isDashboard && location.pathname !== '/' && <Footer />}
        </div>
      </AuthProvider>
    </ThemeProvider >
  );
}

export default App;

