import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LayeredEnvelope from './components/LayeredEnvelope';
import Preloader from './components/Preloader';
import MainLayout from './layouts/MainLayout';
import Invitation from './pages/Invitation';
import Location from './pages/Location';
import RSVP from './pages/RSVP';
import Info from './pages/Info';
import DesktopBlocker from './components/DesktopBlocker';
import { useIsDesktop } from './hooks/useIsDesktop';

export default function App() {
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const isDesktop = useIsDesktop(1024); // Use 1024px as the desktop breakpoint

  if (isDesktop) {
    return <DesktopBlocker />;
  }

  return (
    <BrowserRouter>
      {!isLoaded && <Preloader onLoaded={() => setIsLoaded(true)} />}
      
      {/* The Envelope is an overlay that disappears after dragging the card up */}
      <AnimatePresence>
        {isLoaded && !isEnvelopeOpen && (
          <div className="fixed inset-0 z-50">
            <LayeredEnvelope key="envelope" onOpenComplete={() => setIsEnvelopeOpen(true)} />
          </div>
        )}
      </AnimatePresence>

      {/* The Main App Routing System */}
      <AnimatePresence>
        {isEnvelopeOpen && (
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Invitation />} />
              <Route path="ubicacion" element={<Location />} />
              <Route path="rsvp" element={<RSVP />} />
              <Route path="info" element={<Info />} />
            </Route>
          </Routes>
        )}
      </AnimatePresence>
    </BrowserRouter>
  );
}
