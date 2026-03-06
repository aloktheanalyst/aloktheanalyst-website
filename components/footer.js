/* Shared footer component — injected synchronously via document.currentScript.
   Place <script src="/components/footer.js"></script> just before </body>. */
(function () {
  // ── CSS ────────────────────────────────────────────────────────────────────
  if (!document.getElementById('sfooter-css')) {
    const s = document.createElement('style');
    s.id = 'sfooter-css';
    s.textContent = `
      #sfooter {
        border-top: 1px solid #e2e8f2; padding: 24px;
        font-family: 'DM Sans', 'Space Grotesk', sans-serif;
      }
      #sfooter .sft-inner {
        max-width: 1200px; margin: 0 auto;
        display: flex; align-items: center; justify-content: space-between;
        flex-wrap: wrap; gap: 12px;
      }
      #sfooter .sft-brand {
        font-size: 11px; color: #64748b;
        font-family: 'Space Mono', 'JetBrains Mono', monospace;
      }
      #sfooter .sft-socials { display: flex; gap: 10px; align-items: center; }
      #sfooter .sft-icon {
        width: 32px; height: 32px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        color: #fff; text-decoration: none;
        transition: transform .2s, opacity .2s; opacity: .9;
      }
      #sfooter .sft-icon:hover { transform: translateY(-2px); opacity: 1; }
      #sfooter .sft-icon svg { width: 14px; height: 14px; }
      #sfooter .sfi-yt { background: #ff0000; }
      #sfooter .sfi-li { background: #0a66c2; }
      #sfooter .sfi-ig { background: radial-gradient(circle at 30% 107%, #fdf497 0%, #fd5949 45%, #d6249f 60%, #285aeb 90%); }
      #sfooter .sfi-tg { background: #229ed9; }
      #sfooter .sft-links {
        display: flex; gap: 20px; list-style: none; padding: 0; margin: 0;
      }
      #sfooter .sft-links a {
        font-size: 12px; color: #64748b; text-decoration: none; transition: color .2s;
      }
      #sfooter .sft-links a:hover { color: #0f172a; }
      @media (max-width: 620px) { #sfooter .sft-inner { justify-content: center; text-align: center; } }
    `;
    document.head.appendChild(s);
  }

  // ── SVG icons ──────────────────────────────────────────────────────────────
  const YT = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`;
  const LI = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`;
  const IG = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>`;
  const TG = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>`;

  // ── Inject ─────────────────────────────────────────────────────────────────
  document.currentScript.insertAdjacentHTML('afterend', `
    <footer id="sfooter">
      <div class="sft-inner">
        <div class="sft-brand">© 2025 aloktheanalyst.com — Built with 🔥</div>
        <div class="sft-socials">
          <a href="https://www.youtube.com/@aloktheanalyst" target="_blank" rel="noopener" class="sft-icon sfi-yt" aria-label="YouTube">${YT}</a>
          <a href="https://www.linkedin.com/in/aloktheanalyst/" target="_blank" rel="noopener" class="sft-icon sfi-li" aria-label="LinkedIn">${LI}</a>
          <a href="https://www.instagram.com/aloktheanalyst/" target="_blank" rel="noopener" class="sft-icon sfi-ig" aria-label="Instagram">${IG}</a>
          <a href="https://t.me/aloktheanalyst" target="_blank" rel="noopener" class="sft-icon sfi-tg" aria-label="Telegram">${TG}</a>
        </div>
        <ul class="sft-links">
          <li><a href="/#courses">Courses</a></li>
          <li><a href="https://aloktheanalyst.com/practice">Practice</a></li>
          <li><a href="/#contact">Contact</a></li>
        </ul>
      </div>
    </footer>
  `);
}());
