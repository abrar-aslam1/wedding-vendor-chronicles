
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { lazy, Suspense, useEffect } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CookieConsent } from "@/components/CookieConsent";
import { TermsPopup } from "@/components/TermsPopup";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Lazy load components for better performance
const Index = lazy(() => import("@/pages/Index"));
const Search = lazy(() => import("@/pages/Search"));
const CategorySearch = lazy(() => import("@/pages/CategorySearch"));
const VendorDetail = lazy(() => import("@/pages/VendorDetail"));
const Auth = lazy(() => import("@/pages/Auth"));
const AuthCallback = lazy(() => import("@/pages/AuthCallback"));
const Loading = lazy(() => import("@/pages/Loading"));
const Favorites = lazy(() => import("@/pages/Favorites"));
const Terms = lazy(() => import("@/pages/Terms"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const ListBusiness = lazy(() => import("@/pages/ListBusiness"));
const States = lazy(() => import("@/pages/States"));
const StateDetail = lazy(() => import("@/pages/StateDetail"));
const CityDetail = lazy(() => import("@/pages/CityDetail"));
const Blog = lazy(() => import("@/pages/Blog"));
const UserPortal = lazy(() => import("@/pages/UserPortal"));
const DemoPortal = lazy(() => import("@/pages/DemoPortal"));
const TestAuth = lazy(() => import("@/pages/TestAuth"));
const FreeTimelineGenerator = lazy(() => import("@/pages/FreeTimelineGenerator"));
const WeddingHashtagGenerator = lazy(() => import("@/pages/WeddingHashtagGenerator").then(module => ({ default: module.WeddingHashtagGenerator })));
const AdminPanel = lazy(() => import("@/pages/AdminPanel"));
const TestSubscriptions = lazy(() => import("@/pages/TestSubscriptions"));

// Simple loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wedding-primary"></div>
  </div>
);

function App() {
  // Handle cookie consent for Google Analytics
  const handleCookieAccept = () => {
    // Update Google Analytics consent state
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });
    }
  };

  const handleCookieReject = () => {
    // Keep analytics storage denied
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        'analytics_storage': 'denied'
      });
    }
  };

  // Check for existing consent on mount
  useEffect(() => {
    const consentData = localStorage.getItem('wedding-vendor-cookie-consent');
    if (consentData) {
      try {
        const consent = JSON.parse(consentData);
        if (consent.accepted && typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('consent', 'update', {
            'analytics_storage': 'granted'
          });
        }
      } catch (error) {
        console.error('Error parsing consent data:', error);
      }
    }
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/states" element={<States />} />
          <Route path="/states/:state/:city" element={<CityDetail />} />
          <Route path="/states/:state" element={<StateDetail />} />
          <Route path="/search/:category" element={<CategorySearch />} />
          <Route path="/search/:state/:city" element={<Search />} />
          <Route path="/search/:state" element={<Search />} />
          <Route path="/loading" element={<Loading />} />
          <Route path="/top-20/:category/:city/:state" element={<Search />} />
          <Route path="/top-20/:category/:subcategory/:city/:state" element={<Search />} />
          {/* Catch additional search-like patterns to prevent 404s */}
          <Route path="/top-20/:category" element={<Search />} />
          <Route path="/top-20/:category/:subcategory" element={<Search />} />
          <Route path="/vendor/:vendorId" element={<VendorDetail />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<Blog />} />
          <Route path="/blog/category/:category" element={<Blog />} />
          <Route path="/blog/tag/:tag" element={<Blog />} />
          <Route path="/list-business" element={
            <ProtectedRoute>
              <ListBusiness />
            </ProtectedRoute>
          } />
          <Route path="/portal" element={<UserPortal />} />
          <Route path="/demo-portal" element={<DemoPortal />} />
          <Route path="/test-auth" element={<TestAuth />} />
          <Route path="/free-tools/timeline-generator" element={<FreeTimelineGenerator />} />
          <Route path="/free-tools/hashtag-generator" element={<WeddingHashtagGenerator />} />
          {/* New SEO-optimized routes for Timeline Generator */}
          <Route path="/tools/wedding-timeline-generator" element={<FreeTimelineGenerator />} />
          <Route path="/tools/wedding-timeline-generator/states" element={<FreeTimelineGenerator />} />
          <Route path="/tools/wedding-timeline-generator/states/:state" element={<FreeTimelineGenerator />} />
          <Route path="/tools/wedding-timeline-generator/states/:state/:city" element={<FreeTimelineGenerator />} />
          {/* New SEO-optimized routes for Wedding Hashtag Generator */}
          <Route path="/tools/wedding-hashtag-generator" element={<WeddingHashtagGenerator />} />
          <Route path="/tools/wedding-hashtag-generator/states" element={<WeddingHashtagGenerator />} />
          <Route path="/tools/wedding-hashtag-generator/states/:state" element={<WeddingHashtagGenerator />} />
          <Route path="/tools/wedding-hashtag-generator/states/:state/:city" element={<WeddingHashtagGenerator />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          } />
          <Route path="/test-subscriptions" element={<TestSubscriptions />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
        <Toaster />
        <CookieConsent onAccept={handleCookieAccept} onReject={handleCookieReject} />
        <TermsPopup />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
