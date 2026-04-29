import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import Landing from "@/pages/Landing";
import Pricing from "@/pages/Pricing";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import Clients from "@/pages/clients/Clients";
import Proposals from "@/pages/proposals/Proposals";
import ProposalForm from "@/pages/proposals/ProposalForm";
import ProposalView from "@/pages/proposals/ProposalView";
import PublicProposal from "@/pages/proposals/PublicProposal";
import Admin from "@/pages/admin/Admin";
import SettingsPage from "@/pages/settings/SettingsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/p/:publicCode" element={<PublicProposal />} />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout><Dashboard /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/clients"
              element={
                <ProtectedRoute>
                  <AppLayout><Clients /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/proposals"
              element={
                <ProtectedRoute>
                  <AppLayout><Proposals /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/proposals/new"
              element={
                <ProtectedRoute>
                  <AppLayout><ProposalForm /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/proposals/:id"
              element={
                <ProtectedRoute>
                  <AppLayout><ProposalView /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/proposals/:id/edit"
              element={
                <ProtectedRoute>
                  <AppLayout><ProposalForm /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AppLayout><Admin /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute requireAdmin>
                  <AppLayout><SettingsPage /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
