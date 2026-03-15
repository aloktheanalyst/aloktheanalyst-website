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
      /* Hamburger button — hidden on desktop */
      #snav .snav-hamburger {
        display: none; background: none; border: none; cursor: pointer;
        width: 44px; height: 44px;
        flex-direction: column; align-items: center; justify-content: center; gap: 5px;
        padding: 0; z-index: 1001;
      }
      #snav .snav-hamburger span {
        display: block; width: 22px; height: 2px;
        background: #0f172a; border-radius: 2px;
        transition: transform 0.3s, opacity 0.3s;
      }
      .snav-overlay {
        display: none;
      }

      @media (max-width: 768px) {
        #snav .snav-hamburger { display: flex; }

        #snav .snav-links {
          display: flex; flex-direction: column;
          position: fixed; top: 0; right: 0;
          width: 280px; max-width: 80vw;
          height: 100vh; height: 100dvh;
          background: rgba(248,250,255,0.98);
          backdrop-filter: blur(20px);
          padding: 80px 2rem 2rem; gap: 0;
          box-shadow: -4px 0 30px rgba(0,0,0,0.1);
          transform: translateX(100%);
          transition: transform 0.3s ease;
          z-index: 1000; overflow-y: auto;
        }
        #snav .snav-links.snav-open { transform: translateX(0); }

        #snav .snav-links li { list-style: none; }
        #snav .snav-links a {
          display: flex; align-items: center;
          min-height: 48px; font-size: 1rem; color: #334155;
          border-bottom: 1px solid #e2e8f2; padding: 0;
        }
        #snav .snav-links li:last-child a { border-bottom: none; }
        #snav .snav-cta {
          margin-top: 1rem; text-align: center;
          min-height: 48px; display: flex;
          align-items: center; justify-content: center;
        }

        /* Hamburger X state */
        #snav .snav-hamburger.snav-active span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
        #snav .snav-hamburger.snav-active span:nth-child(2) { opacity: 0; }
        #snav .snav-hamburger.snav-active span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }

        /* Overlay */
        .snav-overlay {
          display: block; position: fixed; inset: 0;
          background: rgba(0,0,0,0.3); z-index: 999;
          opacity: 0; pointer-events: none; transition: opacity 0.3s;
        }
        .snav-overlay.snav-show { opacity: 1; pointer-events: all; }
      }
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
    <div class="snav-overlay" id="snavOverlay"></div>
    <nav id="snav">
      <a href="/" class="snav-logo">ALOK<span>.</span>ANALYST</a>
      <ul class="snav-links">
        ${liHTML}
        <li><a href="https://www.youtube.com/@aloktheanalyst?sub_confirmation=1" target="_blank" rel="noopener" class="snav-cta">Subscribe</a></li>
      </ul>
      <button class="snav-hamburger" id="snavHamburger" aria-label="Open menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </nav>
  `);

  // ── Mobile hamburger toggle ────────────────────────────────────────────────
  const burger  = document.getElementById('snavHamburger');
  const links_el = document.querySelector('#snav .snav-links');
  const overlay = document.getElementById('snavOverlay');
  if (burger && links_el && overlay) {
    function closeMenu() {
      links_el.classList.remove('snav-open');
      burger.classList.remove('snav-active');
      burger.setAttribute('aria-expanded', 'false');
      overlay.classList.remove('snav-show');
      document.body.style.overflow = '';
    }
    burger.addEventListener('click', function () {
      const opening = !links_el.classList.contains('snav-open');
      if (opening) {
        links_el.classList.add('snav-open');
        burger.classList.add('snav-active');
        burger.setAttribute('aria-expanded', 'true');
        overlay.classList.add('snav-show');
        document.body.style.overflow = 'hidden';
      } else {
        closeMenu();
      }
    });
    overlay.addEventListener('click', closeMenu);
    links_el.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  }
}());
