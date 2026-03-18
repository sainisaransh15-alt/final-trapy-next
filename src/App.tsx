import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/hooks/useLanguage";
import ErrorBoundary from "@/components/ErrorBoundary";
import { OfflineDetector } from "@/components/OfflineDetector";
import { AISupportChat } from "@/components/AISupportChat";
import { NotificationPermission } from "@/components/NotificationPermission";
import Navbar from "@/components/Navbar";
import { Loader2 } from "lucide-react";

// Eager load - critical pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy load - less critical pages for better initial bundle size
const Search = lazy(() => import("./pages/Search"));
const FindRide = lazy(() => import("./pages/FindRide"));
const RideDetails = lazy(() => import("./pages/RideDetails"));
const Publish = lazy(() => import("./pages/Publish"));
const Profile = lazy(() => import("./pages/Profile"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const TrapyPass = lazy(() => import("./pages/TrapyPass"));
const Verification = lazy(() => import("./pages/Verification"));
const Messages = lazy(() => import("./pages/Messages"));
const Admin = lazy(() => import("./pages/Admin"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const AccountDeletion = lazy(() => import("./pages/AccountDeletion"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-muted/30">
    <div className="text-center">
      <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <AuthProvider>
            <AppProvider>
              <Toaster />
              <Sonner />
              <OfflineDetector />
              <BrowserRouter>
                <Navbar />
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/find-ride" element={<FindRide />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/ride/:id" element={<RideDetails />} />
                    <Route path="/publish" element={<Publish />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/trapy-pass" element={<TrapyPass />} />
                    <Route path="/verification" element={<Verification />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms-of-service" element={<TermsOfService />} />
                    <Route path="/account-deletion" element={<AccountDeletion />} />
                    <Route path="/refund-policy" element={<RefundPolicy />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
                <AISupportChat />
                <NotificationPermission />
              </BrowserRouter>
            </AppProvider>
          </AuthProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
