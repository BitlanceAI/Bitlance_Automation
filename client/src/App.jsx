import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import ReactGA from 'react-ga4';
import { trackAgentOpen } from './lib/analytics';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/layout/Navbar';
import SplashScreen from './components/layout/SplashScreen';
import Footer from './components/landing/Footer';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WorkspaceProvider } from './context/WorkspaceContext';
import AuthGuard from './components/auth/AuthGuard';
import { Toaster } from 'react-hot-toast';

// ─── Lazy-loaded pages (route-level code splitting) ───────────────────────────
// Public / Landing
const LandingPage         = lazy(() => import('./pages/landing/LandingPage'));
const SeoLandingPage      = lazy(() => import('./pages/landing/SeoLandingPage'));
const QuizLandingPage     = lazy(() => import('./pages/landing/QuizLandingPage'));
const ThankYouPage        = lazy(() => import('./pages/landing/ThankYouPage'));

// Auth
const LoginPage           = lazy(() => import('./pages/auth/LoginPage'));
const SignupPage          = lazy(() => import('./pages/auth/SignupPage'));

// Dashboard (heavy: recharts, fullcalendar, spline, retell, etc.)
const HomePage            = lazy(() => import('./pages/dashboard/HomePage'));
const SalesDashboard      = lazy(() => import('./pages/dashboard/SalesDashboard'));
const SocialDashboard     = lazy(() => import('./pages/dashboard/SocialDashboard'));
const AgentsPage          = lazy(() => import('./pages/dashboard/AgentsPage'));
const BroadcastPage       = lazy(() => import('./pages/dashboard/BroadcastPage'));
const SeoAgentPage        = lazy(() => import('./pages/dashboard/SeoAgentPage'));
const GraphicDesignerPage = lazy(() => import('./pages/dashboard/GraphicDesignerPage'));
const MetaAdsPage         = lazy(() => import('./pages/dashboard/MetaAdsPage'));
const EmailAutomationPage = lazy(() => import('./pages/dashboard/EmailAutomationPage'));

// Admin (heavy: jspdf, xlsx)
const AdminDashboard      = lazy(() => import('./pages/admin/AdminDashboard'));
const ClientHistoryPage   = lazy(() => import('./pages/admin/ClientHistoryPage'));
const CampaignManagerPage = lazy(() => import('./pages/admin/CampaignManagerPage'));
const CampaignWizard      = lazy(() => import('./components/campaigns/CampaignWizard'));

// Blog
const BlogPage            = lazy(() => import('./pages/blog/BlogPage'));
const BlogManagerPage     = lazy(() => import('./pages/blog/BlogManagerPage'));
const BlogEditorPage      = lazy(() => import('./pages/blog/BlogEditorPage'));
const BlogAgentFeaturesPage = lazy(() => import('./pages/blog/BlogAgentFeaturesPage'));
const PublicBlogListPage  = lazy(() => import('./pages/blog/PublicBlogListPage'));
const PublicArticlePage   = lazy(() => import('./pages/blog/PublicArticlePage'));

// Settings
const SettingsPage        = lazy(() => import('./pages/settings/SettingsPage'));

// Public pages
const ContactPage         = lazy(() => import('./pages/public/ContactPage'));
const PrivacyPolicy       = lazy(() => import('./pages/public/PrivacyPolicy'));
const TermsPage           = lazy(() => import('./pages/public/TermsPage'));
const TextGeneratorPage   = lazy(() => import('./pages/public/TextGeneratorPage'));
const EmailGeneratorPage  = lazy(() => import('./pages/public/EmailGeneratorPage'));

// Push notifications
const PushNotificationPage = lazy(() => import('./pages/push/PushNotificationPage'));
const DeviceTokensPage    = lazy(() => import('./pages/push/DeviceTokensPage'));

// eSign
const ESignPage              = lazy(() => import('./pages/esign/ESignDemoPage'));
const ESignCompletePage      = lazy(() => import('./pages/esign/ESignCompletePage'));
const DigiLockerCompletePage = lazy(() => import('./pages/esign/DigiLockerCompletePage'));
const PaymentCompletePage    = lazy(() => import('./pages/esign/PaymentCompletePage'));

// Features & Demos
const VoiceBotFeaturesPage  = lazy(() => import('./pages/features/VoiceBotFeaturesPage'));
const TestimonialDemo        = lazy(() => import('./pages/demos/TestimonialDemo'));
const ShapeHeroDemo          = lazy(() => import('./pages/demos/ShapeHeroDemo'));


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
            <Suspense fallback={null}>
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
            </Suspense>
            {!isDashboard && location.pathname !== '/' && <Footer />}

          </div>
        </WorkspaceProvider>
      </AuthProvider>
    </ThemeProvider >
  );
}

export default App;

