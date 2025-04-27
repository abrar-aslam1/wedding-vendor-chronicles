
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Search from "@/pages/Search";
import VendorDetail from "@/pages/VendorDetail";
import Auth from "@/pages/Auth";
import AuthCallback from "@/pages/AuthCallback";
import Loading from "@/pages/Loading";
import Favorites from "@/pages/Favorites";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import NotFound from "@/pages/NotFound";
import ListBusiness from "@/pages/ListBusiness";
import States from "@/pages/States";
import Blog from "@/pages/Blog";
import UserPortal from "@/pages/UserPortal";
import DemoPortal from "@/pages/DemoPortal";
import TestAuth from "@/pages/TestAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/search/:state" element={<Search />} />
        <Route path="/search/:state/:city" element={<Search />} />
        <Route path="/states" element={<States />} />
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
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
