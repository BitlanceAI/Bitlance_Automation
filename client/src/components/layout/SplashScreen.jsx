import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Dashboard/internal routes where splash should never show
const SKIP_PATHS = ['/home', '/dashboard', '/admin', '/settings', '/agents'];

/**
 * SplashScreen — The actual splash is rendered as native HTML in index.html
 * so it appears BEFORE the JS bundle loads (zero flash).
 *
 * This component's only job is to ensure the native splash element is
 * properly cleaned up once React mounts, and to force-hide it on
 * internal/dashboard routes.
 */
export default function SplashScreen() {
  const location = useLocation();

  useEffect(() => {
    const el = document.getElementById('native-splash');
    if (!el) return;

    const path = location.pathname.toLowerCase();
    const isInternal = SKIP_PATHS.some((p) => path.startsWith(p));

    if (isInternal) {
      // Instantly hide on dashboard / admin routes
      el.style.display = 'none';
      sessionStorage.setItem('bitlance_splash_seen', 'true');
    }
    // On public routes the native splash manages its own timers (set in index.html).
    // Nothing else needed here.
  }, [location.pathname]);

  // Nothing to render — the splash lives in the DOM via index.html
  return null;
}

