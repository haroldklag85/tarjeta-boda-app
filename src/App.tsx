import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LayeredEnvelope from './components/LayeredEnvelope';
import Preloader from './components/Preloader';
import MainLayout from './layouts/MainLayout';
import Invitation from './pages/Invitation';
import Location from './pages/Location';
import RSVP from './pages/RSVP';
import Info from './pages/Info';
import AdminPanel from './pages/AdminPanel';
import DesktopBlocker from './components/DesktopBlocker';
import { useIsDesktop } from './hooks/useIsDesktop';
import ScrollToTop from './components/ScrollToTop';

export default function App() {
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const isDesktop = useIsDesktop(1024);
  const isAdminRoute = window.location.pathname.includes('/admin-panel');

  // Capture invitation code from URL query or path parameter
  useEffect(() => {
    if (isAdminRoute) return;

    const params = new URLSearchParams(window.location.search);
    let code = params.get('code');

    if (!code) {
      const path = window.location.pathname.replace(/^\/|\/$/g, '');
      const reservedRoutes = ['ubicacion', 'rsvp', 'info', 'admin-panel'];
      if (path && !reservedRoutes.includes(path) && !path.includes('/')) {
        code = path;
      }
    }

    if (code) {
      localStorage.setItem('invitation_code', code.toUpperCase());
    }
  }, [isAdminRoute]);

  if (isDesktop && !isAdminRoute) {
    return <DesktopBlocker />;
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      
      {!isAdminRoute && !isEnvelopeOpen && (
        <>
          {!isLoaded && <Preloader onLoaded={() => setIsLoaded(true)} />}
          <AnimatePresence>
            {isLoaded && (
              <div className="fixed inset-0 z-50">
                <LayeredEnvelope key="envelope" onOpenComplete={() => setIsEnvelopeOpen(true)} />
              </div>
            )}
          </AnimatePresence>
        </>
      )}

      <Routes>
        <Route path="/admin-panel" element={<AdminPanel />} />
        
        {/* When envelope is open, render app layout and routes */}
        {isEnvelopeOpen && (
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Invitation />} />
            <Route path="ubicacion" element={<Location />} />
            <Route path="rsvp" element={<RSVP />} />
            <Route path="info" element={<Info />} />
            <Route path="*" element={<Invitation />} />
          </Route>
        )}
        
        {/* Catch-all for initial load if envelope isn't open yet */}
        {!isEnvelopeOpen && <Route path="*" element={<div className="bg-[#F2EFE9] min-h-screen" />} />}
      </Routes>
    </BrowserRouter>
  );
}
