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
      #snav .snav-profile {
        display: flex; align-items: center; gap: 0.65rem;
        text-decoration: none; color: #0f172a;
      }
      #snav .snav-profile-photo {
        width: 36px; height: 36px; border-radius: 50%;
        object-fit: cover; border: 2px solid #2563eb;
        flex-shrink: 0;
      }
      #snav .snav-profile-info { display: flex; flex-direction: column; line-height: 1.15; }
      #snav .snav-profile-name {
        font-family: 'Bebas Neue', monospace; font-size: 1.15rem;
        letter-spacing: 1.5px; color: #0f172a;
      }
      #snav .snav-profile-title {
        font-family: 'DM Sans', sans-serif; font-size: 0.65rem;
        color: #2563eb; font-weight: 600; letter-spacing: 0.3px;
      }
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
      /* User auth button */
      #snav .snav-right { display: flex; align-items: center; gap: 0.75rem; }
      #snav .snav-auth { position: relative; }
      #snav .snav-auth-btn {
        display: flex; align-items: center; gap: 0.45rem;
        padding: 0.35rem 0.75rem; border-radius: 8px;
        border: 1px solid #e2e8f2; background: #fff;
        color: #334155; font-size: 0.78rem; font-weight: 600;
        font-family: 'DM Sans', sans-serif; cursor: pointer;
        transition: all 0.2s; white-space: nowrap;
      }
      #snav .snav-auth-btn:hover { border-color: #2563eb; color: #2563eb; }
      #snav .snav-auth-btn img {
        width: 22px; height: 22px; border-radius: 50%; object-fit: cover;
      }
      #snav .snav-auth-btn .snav-google-icon { width: 14px; height: 14px; }
      #snav .snav-auth-name {
        max-width: 100px; overflow: hidden; text-overflow: ellipsis;
      }
      #snav .snav-auth-menu {
        display: none; position: absolute; top: calc(100% + 6px); right: 0;
        background: #fff; border: 1px solid #e2e8f2; border-radius: 8px;
        padding: 0.4rem; min-width: 160px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.1); z-index: 1002;
      }
      #snav .snav-auth-menu.open { display: block; }
      #snav .snav-auth-menu-item {
        display: block; width: 100%; padding: 0.5rem 0.75rem;
        border: none; background: none; color: #334155;
        font-size: 0.8rem; font-family: 'DM Sans', sans-serif;
        cursor: pointer; border-radius: 5px; text-align: left;
      }
      #snav .snav-auth-menu-item:hover { background: #f1f5f9; }
      #snav .snav-auth-menu-item.snav-logout { color: #ef4444; }
      #snav .snav-auth-profile-header {
        display: flex; align-items: center; gap: 0.6rem;
        padding: 0.6rem 0.75rem 0.5rem; border-bottom: 1px solid #e2e8f2;
        margin-bottom: 0.3rem;
      }
      #snav .snav-auth-profile-header img {
        width: 36px; height: 36px; border-radius: 50%; object-fit: cover;
        border: 2px solid #2563eb;
      }
      #snav .snav-auth-profile-header .snav-auth-profile-details {
        display: flex; flex-direction: column; min-width: 0;
      }
      #snav .snav-auth-profile-header .snav-auth-profile-name {
        font-weight: 600; font-size: 0.82rem; color: #0f172a;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      #snav .snav-auth-profile-header .snav-auth-profile-email {
        font-size: 0.7rem; color: #64748b;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
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
        #snav .snav-profile-photo { width: 32px; height: 32px; }
        #snav .snav-profile-title { display: none; }
        #snav .snav-profile-name { font-size: 1.05rem; }
        #snav .snav-auth-name { display: none; }
        #snav .snav-auth-btn { padding: 0.3rem 0.5rem; }
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
      <a href="/" class="snav-profile">
        <img src="/alok-photo.jpeg" alt="Alok" class="snav-profile-photo" />
        <div class="snav-profile-info">
          <span class="snav-profile-name">ALOK ANALYST</span>
          <span class="snav-profile-title">Lead Data Analyst</span>
        </div>
      </a>
      <ul class="snav-links">
        ${liHTML}
        <li><a href="/practice.html" class="snav-cta">Practice Arena</a></li>
      </ul>
      <div class="snav-right">
        <div class="snav-auth" id="snavAuth">
          <button class="snav-auth-btn" id="snavSignInBtn" onclick="window.location.href='/api/auth/login'">
            <svg class="snav-google-icon" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Sign in
          </button>
          <button class="snav-auth-btn" id="snavUserBtn" style="display:none" onclick="window.__snavToggleAuth()">
            <img id="snavUserPic" src="" alt="" />
            <span class="snav-auth-name" id="snavUserName"></span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M2 4l3 3 3-3"/></svg>
          </button>
          <div class="snav-auth-menu" id="snavAuthMenu">
            <div class="snav-auth-profile-header">
              <img id="snavMenuPic" src="" alt="" />
              <div class="snav-auth-profile-details">
                <span class="snav-auth-profile-name" id="snavMenuName"></span>
                <span class="snav-auth-profile-email" id="snavMenuEmail"></span>
              </div>
            </div>
            <button class="snav-auth-menu-item" onclick="if(typeof openProfileModal==='function')openProfileModal()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px;margin-right:6px"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>My Profile
            </button>
            <button class="snav-auth-menu-item snav-logout" onclick="window.location.href='/api/auth/logout'">Sign out</button>
          </div>
        </div>
        <button class="snav-hamburger" id="snavHamburger" aria-label="Open menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>
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
  // ── User auth check ─────────────────────────────────────────────────────
  window.__snavToggleAuth = function () {
    document.getElementById('snavAuthMenu').classList.toggle('open');
  };

  document.addEventListener('click', function (e) {
    var auth = document.getElementById('snavAuth');
    if (auth && !auth.contains(e.target)) {
      document.getElementById('snavAuthMenu').classList.remove('open');
    }
  });

  // Store user data for profile modal access
  fetch('/api/auth/session').then(function (r) { return r.json(); }).then(function (data) {
    if (data.authenticated && data.user) {
      document.getElementById('snavSignInBtn').style.display = 'none';
      var btn = document.getElementById('snavUserBtn');
      btn.style.display = 'flex';
      window.__snavUser = data.user;
      var name = data.user.name || data.user.email.split('@')[0];
      var pic = data.user.picture || '';
      document.getElementById('snavUserPic').src = pic;
      document.getElementById('snavUserName').textContent = name;
      document.getElementById('snavMenuPic').src = pic;
      document.getElementById('snavMenuName').textContent = name;
      document.getElementById('snavMenuEmail').textContent = data.user.email;
    }
  }).catch(function () {});
}());
