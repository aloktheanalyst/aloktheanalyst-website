/* Shared nav component — injected synchronously via document.currentScript.
   Place <script src="/components/nav.js"></script> as the first child of <body>. */
(function () {
  // ── Fonts ──────────────────────────────────────────────────────────────────
  if (!document.querySelector('link[href*="Bebas+Neue"]')) {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&display=swap';
    document.head.appendChild(l);
  }

  // ── CSS ────────────────────────────────────────────────────────────────────
  if (!document.getElementById('snav-css')) {
    const s = document.createElement('style');
    s.id = 'snav-css';
    s.textContent = `
      #snav {
        position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
        height: 60px; padding: 0 5%;
        display: flex; align-items: center; justify-content: space-between;
        backdrop-filter: blur(20px); background: rgba(248,250,255,0.92);
        border-bottom: 1px solid #e2e8f2;
        box-shadow: 0 1px 12px rgba(37,99,235,0.07);
      }
      #snav .snav-logo {
        font-family: 'Bebas Neue', monospace; font-size: 1.55rem;
        letter-spacing: 2px; color: #0f172a; text-decoration: none;
      }
      #snav .snav-logo span { color: #1d4ed8; }
      #snav .snav-links {
        display: flex; gap: 1.8rem; list-style: none; align-items: center;
        margin: 0; padding: 0;
      }
      #snav .snav-links a {
        color: #64748b; text-decoration: none; font-size: 0.88rem;
        font-weight: 500; letter-spacing: 0.3px; transition: color 0.2s;
        font-family: 'DM Sans', 'Space Grotesk', sans-serif;
      }
      #snav .snav-links a:hover,
      #snav .snav-links a.snav-active { color: #0f172a; }
      #snav .snav-cta {
        background: #2563eb; color: #fff !important;
        padding: 0.45rem 1.1rem; border-radius: 4px;
        font-weight: 600 !important;
        transition: background 0.2s, transform 0.2s !important;
      }
      #snav .snav-cta:hover { background: #1d4ed8 !important; transform: translateY(-1px); }
      @media (max-width: 768px) { #snav .snav-links { display: none; } }
    `;
    document.head.appendChild(s);
  }

  // ── Active-link detection ──────────────────────────────────────────────────
  const path = location.pathname;
  function active(href) {
    if (!href.startsWith('/') || href.startsWith('/#')) return '';
    if (href === '/domain-knowledge/' && path.startsWith('/domain-knowledge')) return ' class="snav-active"';
    if (href === '/practice' && path === '/practice') return ' class="snav-active"';
    return '';
  }

  // ── Links ──────────────────────────────────────────────────────────────────
  const links = [
    { href: '/#youtube',          label: 'Videos' },
    { href: '/#linkedin',         label: 'Posts' },
    { href: '/#courses',          label: 'Courses' },
    { href: '/domain-knowledge/', label: 'Domain Knowledge' },
    { href: 'https://aloktheanalyst.com/practice', label: 'Practice', ext: true },
    { href: '/#contact',          label: 'Contact' },
  ];

  const liHTML = links.map(({ href, label, ext }) => {
    const extAttr = ext ? ' target="_blank" rel="noopener"' : '';
    return `<li><a href="${href}"${extAttr}${active(href)}>${label}</a></li>`;
  }).join('');

  // ── Inject ─────────────────────────────────────────────────────────────────
  document.currentScript.insertAdjacentHTML('afterend', `
    <nav id="snav">
      <a href="/" class="snav-logo">ALOK<span>.</span>ANALYST</a>
      <ul class="snav-links">
        ${liHTML}
        <li><a href="https://www.youtube.com/@aloktheanalyst?sub_confirmation=1" target="_blank" rel="noopener" class="snav-cta">Subscribe</a></li>
      </ul>
    </nav>
  `);
}());
