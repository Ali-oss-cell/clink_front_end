/**
 * Optional third-party analytics (Plausible, Hotjar).
 * Set VITE_PLAUSIBLE_DOMAIN and/or VITE_HOTJAR_ID in `.env` for production.
 */

export function initThirdPartyAnalytics(): void {
  if (typeof document === 'undefined') return;

  const plausibleDomain = import.meta.env.VITE_PLAUSIBLE_DOMAIN as string | undefined;
  if (plausibleDomain?.trim() && !document.querySelector('script[data-clink-plausible]')) {
    const s = document.createElement('script');
    s.defer = true;
    s.setAttribute('data-domain', plausibleDomain.trim());
    s.setAttribute('data-clink-plausible', '1');
    s.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(s);
  }

  const hotjarId = import.meta.env.VITE_HOTJAR_ID as string | undefined;
  if (hotjarId?.trim() && !document.querySelector('script[data-clink-hotjar]')) {
    const hjid = Number.parseInt(hotjarId.trim(), 10);
    if (Number.isFinite(hjid)) {
      const w = window as Window & {
        hj?: (...args: unknown[]) => void;
        _hjSettings?: { hjid: number; hjsv: number };
      };
      w.hj =
        w.hj ||
        function (...args: unknown[]) {
          const q = ((w.hj as unknown as { q?: unknown[] }).q = (w.hj as unknown as { q?: unknown[] }).q || []);
          q.push(args);
        };
      w._hjSettings = { hjid, hjsv: 6 };
      const r = document.createElement('script');
      r.async = true;
      r.setAttribute('data-clink-hotjar', '1');
      r.src = `https://static.hotjar.com/c/hotjar-${hjid}.js?sv=6`;
      document.head.appendChild(r);
    }
  }
}
