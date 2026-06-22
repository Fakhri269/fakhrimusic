import { useState, useEffect } from 'react';

let deferredPrompt = null;

// Capture the install event globally as soon as possible
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Dispatch a custom event so React components can react
  window.dispatchEvent(new Event('pwa-installable'));
});

export const usePWAInstall = () => {
  const [canInstall, setCanInstall] = useState(!!deferredPrompt);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onInstallable = () => setCanInstall(true);
    const onInstalled = () => { setInstalled(true); setCanInstall(false); };

    window.addEventListener('pwa-installable', onInstallable);
    window.addEventListener('appinstalled', onInstalled);

    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      setCanInstall(false);
    }

    return () => {
      window.removeEventListener('pwa-installable', onInstallable);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    setCanInstall(false);
    if (outcome === 'accepted') setInstalled(true);
    return outcome === 'accepted';
  };

  return { canInstall, installed, install };
};
