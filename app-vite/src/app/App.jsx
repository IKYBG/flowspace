import React from 'react';
import { supabase } from '../lib/supabase.js';

/*
  Écran de validation de la migration (Phase 1).
  But : prouver que la chaîne Vite → React → Supabase (en ESM bundlé, SANS les
  5 <script> CDN) fonctionne de bout en bout. Une fois validé, les écrans réels
  (Auth, Dashboard, Focus…) sont portés un par un dans src/screens/.
*/
export default function App() {
  const [status, setStatus] = React.useState('checking');
  const [detail, setDetail] = React.useState('');

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // Le client Supabase bundlé répond-il ? (annuaire d'amis créé récemment)
        const { error } = await supabase.from('profiles_public').select('user_id').limit(1);
        if (!alive) return;
        if (error && !/permission|row-level|JWT|Results contain 0 rows/i.test(error.message || '')) {
          setStatus('warn');
          setDetail(error.message);
        } else {
          setStatus('ok');
          setDetail('Client Supabase bundlé opérationnel.');
        }
      } catch (e) {
        if (alive) { setStatus('warn'); setDetail(String(e)); }
      }
    })();
    return () => { alive = false; };
  }, []);

  const dot = status === 'ok' ? 'var(--mineral-cyan)' : status === 'warn' ? '#ffb36b' : 'var(--mineral-muted)';

  return (
    <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{
        maxWidth: 520, width: '100%', borderRadius: 24, padding: '32px 30px',
        background: 'linear-gradient(155deg, rgba(143,220,255,0.10), rgba(16,19,31,0.9))',
        border: '1px solid rgba(143,220,255,0.20)',
        boxShadow: '0 24px 70px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <span style={{ width: 40, height: 40, borderRadius: 13, display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,var(--theme-c1),var(--theme-c2))', color: '#07070d', fontWeight: 900, fontSize: 18 }}>L</span>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 850, fontSize: 18 }}>LumenOS · build Vite</div>
            <div style={{ fontSize: 12, color: 'var(--mineral-muted)' }}>Migration bundler — Phase 1</div>
          </div>
        </div>
        <p style={{ fontSize: 13.5, lineHeight: 1.7, color: 'var(--mineral-muted)', margin: '0 0 18px' }}>
          Cette page est servie par un vrai bundler : plus de Babel dans le navigateur,
          plus de transpilation de 17 000 lignes à chaque visite. React, ReactDOM et
          Supabase sont compilés et découpés en chunks mis en cache.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 700 }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: dot, boxShadow: `0 0 10px ${dot}` }} />
          {status === 'checking' ? 'Vérification de la connexion Supabase…' : detail}
        </div>
      </div>
    </div>
  );
}
