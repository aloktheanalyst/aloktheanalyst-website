/* Shared feedback widget — floating button + chat-like panel.
   Place <script src="/components/feedback.js"></script> before </body>. */
(function () {
  // ── CSS ────────────────────────────────────────────────────────────────────
  if (document.getElementById('sfeedback-css')) return;
  var s = document.createElement('style');
  s.id = 'sfeedback-css';
  s.textContent = [
    /* Floating trigger button */
    '.sfb-trigger {',
    '  position:fixed;bottom:1.5rem;left:1.5rem;z-index:1500;',
    '  width:48px;height:48px;border-radius:50%;border:none;',
    '  background:#2563eb;color:#fff;cursor:pointer;',
    '  box-shadow:0 4px 16px rgba(37,99,235,0.35);',
    '  display:flex;align-items:center;justify-content:center;',
    '  transition:transform 0.2s,box-shadow 0.2s;',
    '}',
    '.sfb-trigger:hover { transform:scale(1.08);box-shadow:0 6px 24px rgba(37,99,235,0.45); }',
    '.sfb-trigger svg { width:22px;height:22px; }',

    /* Panel */
    '.sfb-panel {',
    '  position:fixed;bottom:5.5rem;left:1.5rem;z-index:1600;',
    '  width:370px;max-height:480px;',
    '  background:#fff;border:1px solid #e2e8f2;border-radius:14px;',
    '  box-shadow:0 12px 40px rgba(15,23,42,0.15);',
    '  display:none;flex-direction:column;overflow:hidden;',
    '  font-family:"DM Sans",sans-serif;',
    '}',
    '.sfb-panel.open { display:flex; }',

    /* Header */
    '.sfb-header {',
    '  display:flex;align-items:center;justify-content:space-between;',
    '  padding:0.85rem 1rem;border-bottom:1px solid #e2e8f2;',
    '}',
    '.sfb-header-title {',
    '  font-family:"Bebas Neue",sans-serif;font-size:1.1rem;',
    '  letter-spacing:1.5px;color:#0f172a;',
    '}',
    '.sfb-close {',
    '  background:none;border:none;cursor:pointer;color:#94a3b8;',
    '  padding:0.2rem;line-height:1;transition:color 0.2s;',
    '}',
    '.sfb-close:hover { color:#0f172a; }',

    /* Messages area */
    '.sfb-messages {',
    '  flex:1;overflow-y:auto;padding:1rem;',
    '  display:flex;flex-direction:column;gap:0.6rem;',
    '  min-height:120px;max-height:300px;',
    '}',
    '.sfb-msg {',
    '  max-width:85%;padding:0.6rem 0.85rem;border-radius:12px;',
    '  font-size:0.82rem;line-height:1.5;word-wrap:break-word;',
    '}',
    '.sfb-msg.system {',
    '  background:#f1f5f9;color:#334155;align-self:flex-start;',
    '}',
    '.sfb-msg.user {',
    '  background:#2563eb;color:#fff;align-self:flex-end;',
    '}',
    '.sfb-msg.success {',
    '  background:#dcfce7;color:#166534;align-self:flex-start;',
    '}',
    '.sfb-msg.error {',
    '  background:#fef2f2;color:#991b1b;align-self:flex-start;',
    '}',

    /* Screenshot preview */
    '.sfb-screenshot {',
    '  display:flex;align-items:center;gap:0.5rem;',
    '  padding:0.5rem 1rem;border-top:1px solid #e2e8f2;',
    '  font-size:0.72rem;color:#64748b;',
    '}',
    '.sfb-screenshot img {',
    '  width:48px;height:32px;object-fit:cover;border-radius:4px;',
    '  border:1px solid #e2e8f2;',
    '}',
    '.sfb-screenshot-label { flex:1; }',
    '.sfb-screenshot-remove {',
    '  background:none;border:none;cursor:pointer;color:#94a3b8;',
    '  font-size:0.75rem;padding:0.2rem;',
    '}',
    '.sfb-screenshot-remove:hover { color:#ef4444; }',

    /* Input area */
    '.sfb-input-area {',
    '  display:flex;align-items:flex-end;gap:0.5rem;',
    '  padding:0.75rem 1rem;border-top:1px solid #e2e8f2;',
    '}',
    '.sfb-input {',
    '  flex:1;resize:none;border:1px solid #e2e8f2;border-radius:10px;',
    '  padding:0.55rem 0.75rem;font-size:0.82rem;font-family:"DM Sans",sans-serif;',
    '  color:#334155;background:#f8faff;outline:none;',
    '  min-height:38px;max-height:100px;line-height:1.4;',
    '}',
    '.sfb-input:focus { border-color:#2563eb; }',
    '.sfb-input::placeholder { color:#94a3b8; }',
    '.sfb-send {',
    '  width:36px;height:36px;border-radius:50%;border:none;',
    '  background:#2563eb;color:#fff;cursor:pointer;flex-shrink:0;',
    '  display:flex;align-items:center;justify-content:center;',
    '  transition:background 0.2s;',
    '}',
    '.sfb-send:hover { background:#1d4ed8; }',
    '.sfb-send:disabled { background:#94a3b8;cursor:not-allowed; }',
    '.sfb-send svg { width:16px;height:16px; }',

    /* Mobile */
    '@media (max-width:768px) {',
    '  .sfb-panel {',
    '    left:0;right:0;bottom:0;width:100%;max-height:75vh;',
    '    border-radius:14px 14px 0 0;',
    '  }',
    '  .sfb-trigger { bottom:1rem;left:1rem;width:44px;height:44px; }',
    '}',
  ].join('\n');
  document.head.appendChild(s);

  // ── HTML ───────────────────────────────────────────────────────────────────
  document.body.insertAdjacentHTML('beforeend', [
    '<button class="sfb-trigger" id="sfbTrigger" aria-label="Send feedback" title="Send feedback">',
    '  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    '</button>',
    '<div class="sfb-panel" id="sfbPanel">',
    '  <div class="sfb-header">',
    '    <div class="sfb-header-title">SEND FEEDBACK</div>',
    '    <button class="sfb-close" id="sfbClose" aria-label="Close">',
    '      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>',
    '    </button>',
    '  </div>',
    '  <div class="sfb-messages" id="sfbMessages">',
    '    <div class="sfb-msg system">Hi! Share any feedback, bug reports, or suggestions. A screenshot of this page will be attached automatically.</div>',
    '  </div>',
    '  <div class="sfb-screenshot" id="sfbScreenshot" style="display:none;">',
    '    <img id="sfbScreenshotImg" src="" alt="Screenshot" />',
    '    <span class="sfb-screenshot-label">Screenshot attached</span>',
    '    <button class="sfb-screenshot-remove" id="sfbScreenshotRemove" title="Remove screenshot">&times;</button>',
    '  </div>',
    '  <div class="sfb-input-area">',
    '    <textarea class="sfb-input" id="sfbInput" placeholder="Describe your feedback..." rows="1"></textarea>',
    '    <button class="sfb-send" id="sfbSend" aria-label="Send">',
    '      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>',
    '    </button>',
    '  </div>',
    '</div>',
  ].join('\n'));

  // ── State ──────────────────────────────────────────────────────────────────
  var panel = document.getElementById('sfbPanel');
  var trigger = document.getElementById('sfbTrigger');
  var messages = document.getElementById('sfbMessages');
  var input = document.getElementById('sfbInput');
  var sendBtn = document.getElementById('sfbSend');
  var screenshotArea = document.getElementById('sfbScreenshot');
  var screenshotImg = document.getElementById('sfbScreenshotImg');
  var screenshotRemove = document.getElementById('sfbScreenshotRemove');
  var screenshotBase64 = null;
  var sending = false;
  var html2canvasLoaded = false;

  // ── Toggle panel ───────────────────────────────────────────────────────────
  trigger.addEventListener('click', function () {
    var isOpen = panel.classList.contains('open');
    if (isOpen) {
      panel.classList.remove('open');
    } else {
      panel.classList.add('open');
      input.focus();
      captureScreenshot();
    }
  });

  document.getElementById('sfbClose').addEventListener('click', function () {
    panel.classList.remove('open');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.classList.contains('open')) {
      panel.classList.remove('open');
    }
  });

  // ── Screenshot capture ─────────────────────────────────────────────────────
  function loadHtml2Canvas(cb) {
    if (html2canvasLoaded) return cb();
    var script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script.onload = function () { html2canvasLoaded = true; cb(); };
    script.onerror = function () { cb(); }; // proceed without screenshot
    document.head.appendChild(script);
  }

  function captureScreenshot() {
    // Hide the feedback panel temporarily for a clean screenshot
    panel.style.display = 'none';
    trigger.style.display = 'none';

    loadHtml2Canvas(function () {
      if (typeof html2canvas !== 'function') {
        panel.style.display = '';
        trigger.style.display = '';
        return;
      }
      html2canvas(document.body, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
      }).then(function (canvas) {
        panel.style.display = '';
        trigger.style.display = '';
        panel.classList.add('open');
        try {
          var dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          screenshotBase64 = dataUrl.split(',')[1]; // strip data:image/jpeg;base64,
          screenshotImg.src = dataUrl;
          screenshotArea.style.display = 'flex';
        } catch (e) {
          screenshotBase64 = null;
          screenshotArea.style.display = 'none';
        }
      }).catch(function () {
        panel.style.display = '';
        trigger.style.display = '';
        panel.classList.add('open');
      });
    });
  }

  screenshotRemove.addEventListener('click', function () {
    screenshotBase64 = null;
    screenshotArea.style.display = 'none';
  });

  // ── Auto-resize textarea ───────────────────────────────────────────────────
  input.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 100) + 'px';
  });

  // ── Send feedback ──────────────────────────────────────────────────────────
  function addMessage(text, type) {
    var div = document.createElement('div');
    div.className = 'sfb-msg ' + type;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function send() {
    var text = input.value.trim();
    if (!text || sending) return;

    addMessage(text, 'user');
    input.value = '';
    input.style.height = 'auto';
    sending = true;
    sendBtn.disabled = true;

    // Gather debugging context from the page
    var context = {};
    try {
      if (typeof activeCaseId !== 'undefined' && activeCaseId) context.activeCase = activeCaseId;
      if (typeof sqlDialect !== 'undefined' && sqlDialect) context.dialect = sqlDialect;
      // Get the case title from sidebar
      var activeItem = document.querySelector('.prompt-item.active .prompt-item-title span');
      if (activeItem) context.caseTitle = activeItem.textContent;
      // Get username from profile if available
      var profile = null;
      try { profile = JSON.parse(localStorage.getItem('userProfile') || 'null'); } catch(e) {}
      if (profile && profile.name) context.userName = profile.name;
      if (profile && profile.email) context.userEmail = profile.email;
      // Capture any error in results area
      var errEl = document.querySelector('.sql-error');
      if (errEl) context.errorText = errEl.textContent.substring(0, 500);
      // Current AI provider
      if (typeof currentProvider !== 'undefined') context.aiProvider = currentProvider;
    } catch(e) {}

    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        screenshot: screenshotBase64,
        page: location.pathname,
        userAgent: navigator.userAgent,
        context: context,
      }),
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.ok) {
          addMessage('Thank you! Your feedback has been sent.', 'success');
          screenshotBase64 = null;
          screenshotArea.style.display = 'none';
        } else {
          addMessage(data.error || 'Something went wrong. Please try again.', 'error');
        }
      })
      .catch(function () {
        addMessage('Failed to send. Please check your connection and try again.', 'error');
      })
      .finally(function () {
        sending = false;
        // Cooldown: re-enable after 10 seconds
        setTimeout(function () { sendBtn.disabled = false; }, 10000);
      });
  }

  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });
}());
