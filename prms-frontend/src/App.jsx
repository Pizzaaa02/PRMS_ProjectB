import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { CustomizationProvider } from './contexts/CustomizationContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import PublicPageTransition from './components/PublicPageTransition';

/*  Public pages  */
import GuestHome from './pages/GuestHome';
import GuestProperties from './pages/GuestProperties';
import PropertyDetail from './pages/PropertyDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import RoleSelection from './pages/RoleSelection';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

/*  Admin  */
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminCategories from './pages/AdminCategories';
import AdminSimplePage from './pages/AdminSimplePage';

/*  Landlord  */
import LandlordLayout from './components/LandlordLayout';
import LandlordDashboard from './pages/LandlordDashboard';
import LandlordSimplePage from './pages/LandlordSimplePage';

/*  Tenant  */
import TenantLayout from './components/TenantLayout';
import TenantDashboard from './pages/TenantDashboard';
import TenantSimplePage from './pages/TenantSimplePage';

/*  Agent  */
import AgentLayout from './components/AgentLayout';
import AgentDashboard from './pages/AgentDashboard';
import AgentCategories from './pages/AgentCategories';
import AgentSimplePage from './pages/AgentSimplePage';

/*  Shared  */
import Properties from './pages/Properties';
import Settings from './pages/Settings';
import WebsiteCustomizer from './pages/WebsiteCustomizer';
import AddProperty from './pages/AddProperty';
import Profile from './pages/Profile';
import SearchPage from './pages/SearchPage';
import ErrorBoundary from './components/ErrorBoundary';
import FinanceDashboard from './pages/FinanceDashboard';
import LandlordHeatmap from './pages/LandlordHeatmap';
import PaymentReceipt from './pages/PaymentReceipt';
import CommunicationHub from './components/CommunicationHub';

function AppRoutes() {
  const { loading } = useAuth();

  /* Block rendering routes until hydration is done */
  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <p>Loading PRMS...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/*  Issue #1: GuestHome is the default landing page  */}
      <Route path="/" element={<GuestHome />} />

      {/*  Issue #5: Public guest-properties route  */}
      <Route path="/properties" element={<GuestProperties />} />

      {/*  Issue #12: PropertyDetail page  */}
      <Route path="/properties/:id" element={<PropertyDetail />} />

      {/*  Public routes (auth-001: RoleSelection -> Register -> Login)  */}
      <Route
        path="/role-selection"
        element={
          <PublicRoute>
            <PublicPageTransition>
              <RoleSelection />
            </PublicPageTransition>
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <PublicPageTransition>
              <Login />
            </PublicPageTransition>
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <PublicPageTransition>
              <Register />
            </PublicPageTransition>
          </PublicRoute>
        }
      />

      {/*  Admin routes (AUTH-006: role-protected)  */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <ErrorBoundary>
              <AdminLayout />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminSimplePage label="User Management" />} />
        <Route path="profile" element={<Profile />} />
        <Route path="properties" element={<Properties />} />
        <Route path="bookings" element={<AdminSimplePage label="Booking Management" />} />
        <Route path="finance" element={<FinanceDashboard />} />
        <Route path="maintenance" element={<AdminSimplePage label="Maintenance Center" />} />
        <Route path="messages" element={<CommunicationHub />} />
        <Route path="reports" element={<AdminSimplePage label="Reports & Audit" />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="settings" element={<Settings />} />
        <Route path="settings/customizer" element={<WebsiteCustomizer />} />
        <Route path="help" element={<AdminSimplePage label="Admin Help Center" />} />
      </Route>

      {/*  Landlord routes (AUTH-006: role-protected)  */}
      <Route
        path="/landlord/*"
        element={
          <ProtectedRoute allowedRoles={['Landlord']}>
            <ErrorBoundary>
              <LandlordLayout />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      >
        <Route index element={<LandlordDashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="properties" element={<Properties />} />
        <Route path="properties/add" element={<AddProperty />} />
        <Route path="bookings" element={<LandlordSimplePage label="My Bookings" />} />
        <Route path="finance" element={<FinanceDashboard />} />
        <Route path="heatmap" element={<LandlordHeatmap />} />
        <Route path="maintenance" element={<LandlordSimplePage label="Maintenance Requests" />} />
        <Route path="messages" element={<CommunicationHub />} />
        <Route path="settings" element={<Settings />} />
        <Route path="settings/customizer" element={<WebsiteCustomizer />} />
        <Route path="help" element={<LandlordSimplePage label="Help Center" />} />
      </Route>

      {/*  Tenant routes (AUTH-006: role-protected)  */}
      <Route
        path="/tenant/*"
        element={
          <ProtectedRoute allowedRoles={['Tenant']}>
            <ErrorBoundary>
              <TenantLayout />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      >
        <Route index element={<TenantDashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="properties" element={<Properties />} />
        <Route path="bookings" element={<TenantSimplePage label="My Bookings" />} />
        <Route path="payments" element={<TenantSimplePage label="Payments" />} />
        <Route path="payments/:id" element={<PaymentReceipt />} />
        <Route path="maintenance" element={<TenantSimplePage label="Maintenance Requests" />} />
        <Route path="messages" element={<TenantSimplePage label="Messages"><CommunicationHub /></TenantSimplePage>} />
        <Route path="settings" element={<Settings />} />
        <Route path="settings/customizer" element={<WebsiteCustomizer />} />
        <Route path="help" element={<TenantSimplePage label="Help Center" />} />
      </Route>

      {/*  Agent routes (AUTH-006: role-protected)  */}
      <Route
        path="/agent/*"
        element={
          <ProtectedRoute allowedRoles={['Agent']}>
            <ErrorBoundary>
              <AgentLayout />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      >
        <Route index element={<AgentDashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="properties" element={<AgentSimplePage label="Assigned Properties" />} />
        <Route path="bookings" element={<AgentSimplePage label="My Bookings" />} />
        <Route path="maintenance" element={<AgentSimplePage label="Maintenance Requests" />} />
        <Route path="categories" element={<AgentCategories />} />
        <Route path="settings" element={<Settings />} />
        <Route path="help" element={<AgentSimplePage label="Help Center" />} />
      </Route>

      {/*  Search page (public)  */}
      <Route path="/search" element={<SearchPage />} />

      {/*  Issue #30: Fallback to 404 NotFound  */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <SettingsProvider>
          <CustomizationProvider>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </CustomizationProvider>
        </SettingsProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
