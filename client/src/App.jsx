import { lazy, Suspense, useLayoutEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import ProtectedAdminRoute from './components/ProtectedAdminRoute';

const Home = lazy(() => import('./pages/Home'));
const Services = lazy(() => import('./pages/Services'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));
const CoverageAreas = lazy(() => import('./pages/CoverageAreas'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Reviews = lazy(() => import('./pages/Reviews'));
const FAQ = lazy(() => import('./pages/FAQ'));

const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
};

const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/services" element={<Services />} />

          <Route
            path="/services/:slug"
            element={<ServiceDetail />}
          />

          <Route
            path="/coverage-areas"
            element={<CoverageAreas />}
          />

          <Route path="/about" element={<About />} />

          <Route path="/contact" element={<Contact />} />

          <Route path="/reviews" element={<Reviews />} />

          <Route path="/faq" element={<FAQ />} />

          <Route
            path="/admin/login"
            element={<AdminLogin />}
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
