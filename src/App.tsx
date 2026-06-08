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
import SharePhotos from './pages/SharePhotos';
import DesktopBlocker from './components/DesktopBlocker';
import { useIsDesktop } from './hooks/useIsDesktop';
import ScrollToTop from './components/ScrollToTop';
import { supabase } from './utils/supabase';

export default function App() {
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const isDesktop = useIsDesktop(1024);
  const isAdminRoute = window.location.pathname.includes('/admin-panel');
  const isSharePhotosRoute = window.location.pathname.includes('/compartir-fotos');

  // Capture invitation code from URL query or path parameter and pre-fetch details
  useEffect(() => {
    if (isAdminRoute) return;

    const params = new URLSearchParams(window.location.search);
    let code = params.get('code');

    if (!code) {
      const path = window.location.pathname.replace(/^\/|\/$/g, '');
      const reservedRoutes = ['ubicacion', 'rsvp', 'info', 'admin-panel', 'compartir-fotos'];
      if (path && !reservedRoutes.includes(path) && !path.includes('/')) {
        code = path;
      }
    }

    if (code) {
      const upperCode = code.toUpperCase();
      localStorage.setItem('invitation_code', upperCode);
      
      const fetchDetails = async () => {
        try {
          const { data, error } = await supabase
            .from('invitations')
            .select('group_name, custom_message')
            .eq('code', upperCode)
            .single();

          if (error) throw error;
          if (data) {
            localStorage.setItem('invitation_group_name', data.group_name);
            if (data.custom_message) {
              localStorage.setItem('invitation_custom_message', data.custom_message);
            } else {
              localStorage.removeItem('invitation_custom_message');
            }
          }
        } catch (err) {
          console.error('Error pre-fetching invitation details:', err);
          localStorage.setItem('invitation_group_name', 'Familia y Amigos');
          localStorage.removeItem('invitation_custom_message');
        } finally {
          // Trigger a custom event to notify components that details are loaded
          window.dispatchEvent(new Event('invitation_loaded'));
        }
      };

      fetchDetails();
    } else {
      localStorage.setItem('invitation_group_name', 'Familia y Amigos');
      localStorage.removeItem('invitation_custom_message');
      window.dispatchEvent(new Event('invitation_loaded'));
    }
  }, [isAdminRoute]);

  if (isDesktop && !isAdminRoute && !isSharePhotosRoute) {
    return <DesktopBlocker />;
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      
      {!isAdminRoute && !isSharePhotosRoute && !isEnvelopeOpen && (
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
        <Route path="/compartir-fotos" element={<SharePhotos />} />
        
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
