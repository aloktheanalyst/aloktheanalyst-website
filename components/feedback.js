/* Shared feedback widget — modal version.
   Triggered via SFeedback.toggle() or SFeedback.open().
   Place <script src="/components/feedback.js"></script> before </body>. */
(function () {
  if (document.getElementById('sfeedback-css')) return;

  // ── CSS ────────────────────────────────────────────────────────────────────
  var s = document.createElement('style');
  s.id = 'sfeedback-css';
  s.textContent = [
    /* Hidden programmatic trigger */
    '.sfb-trigger { display:none; }',

    /* Backdrop */
    '.sfb-backdrop {',
    '  position:fixed;inset:0;z-index:1599;',
    '  background:rgba(15,23,42,0.45);',
    '  display:none;align-items:center;justify-content:center;',
    '  padding:1rem;',
    '}',
    '.sfb-backdrop.open { display:flex; }',

    /* Modal card */
    '.sfb-modal {',
    '  background:#fff;border-radius:16px;',
    '  box-shadow:0 20px 60px rgba(15,23,42,0.22);',
    '  width:100%;max-width:460px;',
    '  display:flex;flex-direction:column;overflow:hidden;',
    '  font-family:"DM Sans",sans-serif;',
    '  max-height:90vh;',
    '}',

    /* Header */
    '.sfb-header {',
    '  display:flex;align-items:center;justify-content:space-between;',
    '  padding:1.2rem 1.4rem;border-bottom:1px solid #f1f5f9;flex-shrink:0;',
    '}',
    '.sfb-header-title {',
    '  font-family:"Bebas Neue",sans-serif;font-size:1.2rem;',
    '  letter-spacing:2px;color:#0f172a;display:flex;align-items:center;gap:0.45rem;',
    '}',
    '.sfb-close {',
    '  background:none;border:none;cursor:pointer;color:#94a3b8;',
    '  padding:0.3rem;line-height:1;transition:color 0.15s;border-radius:6px;',
    '}',
    '.sfb-close:hover { color:#0f172a;background:#f1f5f9; }',

    /* Step 1: Category selection */
    '.sfb-step-cats { padding:1.4rem; }',
    '.sfb-cat-prompt {',
    '  font-size:0.88rem;color:#64748b;margin-bottom:0.85rem;line-height:1.4;',
    '}',
    '.sfb-cats { display:flex;flex-direction:column;gap:0.5rem; }',
    '.sfb-cat {',
    '  display:flex;align-items:center;gap:0.75rem;',
    '  padding:0.85rem 1rem;border-radius:10px;border:1.5px solid #e2e8f2;',
    '  background:#f8faff;cursor:pointer;text-align:left;width:100%;',
    '  font-size:0.9rem;color:#334155;font-family:"DM Sans",sans-serif;',
    '  transition:border-color 0.15s,background 0.15s,transform 0.1s;',
    '}',
    '.sfb-cat:hover { border-color:#2563eb;background:#eff6ff;color:#1d4ed8;transform:translateX(2px); }',
    '.sfb-cat-icon { font-size:1.15rem;line-height:1;flex-shrink:0; }',
    '.sfb-cat-label { font-weight:600;flex:1; }',
    '.sfb-cat-desc { font-size:0.78rem;color:#94a3b8; }',

    /* Step 2: Input step */
    '.sfb-step-input { display:flex;flex-direction:column;overflow:hidden; }',

    /* Messages */
    '.sfb-messages {',
    '  overflow-y:auto;padding:1rem 1.4rem 0;',
    '  display:flex;flex-direction:column;gap:0.5rem;',
    '  max-height:140px;flex-shrink:0;',
    '}',
    '.sfb-msg {',
    '  max-width:88%;padding:0.6rem 0.9rem;border-radius:10px;',
    '  font-size:0.85rem;line-height:1.5;word-wrap:break-word;',
    '}',
    '.sfb-msg.user   { background:#2563eb;color:#fff;align-self:flex-end; }',
    '.sfb-msg.success{ background:#dcfce7;color:#166534;align-self:flex-start; }',
    '.sfb-msg.error  { background:#fef2f2;color:#991b1b;align-self:flex-start; }',

    /* Back link */
    '.sfb-back-row { padding:0.75rem 1.4rem 0; }',
    '.sfb-back {',
    '  background:none;border:none;cursor:pointer;',
    '  color:#94a3b8;font-size:0.8rem;font-family:"DM Sans",sans-serif;',
    '  padding:0;display:flex;align-items:center;gap:0.25rem;transition:color 0.15s;',
    '}',
    '.sfb-back:hover { color:#2563eb; }',

    /* Screenshot */
    '.sfb-screenshot {',
    '  display:flex;align-items:center;gap:0.7rem;',
    '  padding:0.7rem 1.4rem;border-top:1px solid #f1f5f9;margin-top:0.6rem;',
    '  font-size:0.8rem;color:#64748b;',
    '}',
    '.sfb-screenshot img {',
    '  width:56px;height:36px;object-fit:cover;border-radius:5px;',
    '  border:1px solid #e2e8f2;flex-shrink:0;',
    '}',
    '.sfb-screenshot-label { flex:1; }',
    '.sfb-screenshot-remove {',
    '  background:none;border:none;cursor:pointer;color:#94a3b8;',
    '  font-size:0.85rem;padding:0.2rem;line-height:1;transition:color 0.15s;',
    '}',
    '.sfb-screenshot-remove:hover { color:#ef4444; }',

    /* Input area */
    '.sfb-input-area {',
    '  display:flex;align-items:flex-end;gap:0.6rem;',
    '  padding:0.9rem 1.4rem 1.2rem;border-top:1px solid #f1f5f9;margin-top:0.6rem;flex-shrink:0;',
    '}',
    '.sfb-input-label {',
    '  font-size:0.82rem;color:#64748b;padding:0.5rem 1.4rem 0;',
    '}',
    '.sfb-input {',
    '  flex:1;resize:none;border:1.5px solid #e2e8f2;border-radius:10px;',
    '  padding:0.8rem 1rem;font-size:0.9rem;font-family:"DM Sans",sans-serif;',
    '  color:#334155;background:#f8faff;outline:none;',
    '  min-height:140px;max-height:260px;line-height:1.6;',
    '}',
    '.sfb-input:focus { border-color:#2563eb;background:#fff; }',
    '.sfb-input::placeholder { color:#94a3b8; }',
    '.sfb-send {',
    '  width:40px;height:40px;border-radius:50%;border:none;',
    '  background:#2563eb;color:#fff;cursor:pointer;flex-shrink:0;',
    '  display:flex;align-items:center;justify-content:center;',
    '  transition:background 0.15s;',
    '}',
    '.sfb-send:hover { background:#1d4ed8; }',
    '.sfb-send:disabled { background:#94a3b8;cursor:not-allowed; }',
    '.sfb-send svg { width:17px;height:17px; }',

    /* Mobile — bottom sheet */
    '@media (max-width:540px) {',
    '  .sfb-backdrop { align-items:flex-end;padding:0; }',
    '  .sfb-modal { max-width:100%;border-radius:16px 16px 0 0; }',
    '}',
  ].join('\n');
  document.head.appendChild(s);

  // ── Category config ────────────────────────────────────────────────────────
  var CATS = [
    { id: 'bug',          icon: '🐛', label: 'Bug',          desc: 'Something broken',    placeholder: 'What went wrong? What did you expect to happen?' },
    { id: 'wrong-answer', icon: '❓', label: 'Wrong answer', desc: 'Incorrect content',   placeholder: 'What do you think is incorrect or missing?' },
    { id: 'suggestion',   icon: '💡', label: 'Suggestion',   desc: 'Idea or improvement', placeholder: 'What would you like to see added or improved?' },
  ];

  // ── HTML ───────────────────────────────────────────────────────────────────
  document.body.insertAdjacentHTML('beforeend', [
    '<button class="sfb-trigger" id="sfbTrigger" aria-label="Send feedback"></button>',
    '<div class="sfb-backdrop" id="sfbBackdrop">',
    '  <div class="sfb-modal" id="sfbPanel" role="dialog" aria-modal="true" aria-label="Send feedback">',
    '    <div class="sfb-header">',
    '      <div class="sfb-header-title" id="sfbHeaderTitle">SEND FEEDBACK</div>',
    '      <button class="sfb-close" id="sfbClose" aria-label="Close">',
    '        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>',
    '      </button>',
    '    </div>',

    '    <div class="sfb-step-cats" id="sfbStepCats">',
    '      <div class="sfb-cat-prompt">What kind of feedback do you have for us?</div>',
    '      <div class="sfb-cats" id="sfbCats"></div>',
    '    </div>',

    '    <div class="sfb-step-input" id="sfbStepInput" style="display:none">',
    '      <div class="sfb-messages" id="sfbMessages"></div>',
    '      <div class="sfb-back-row">',
    '        <button class="sfb-back" id="sfbBack">← Change category</button>',
    '      </div>',
    '      <div class="sfb-screenshot" id="sfbScreenshot" style="display:none">',
    '        <img id="sfbScreenshotImg" src="" alt="Screenshot" />',
    '        <span class="sfb-screenshot-label">Screenshot attached</span>',
    '        <button class="sfb-screenshot-remove" id="sfbScreenshotRemove" title="Remove">&times;</button>',
    '      </div>',
    '      <div class="sfb-input-label">The more detail you give, the faster we can fix it ✍️</div>',
    '      <div class="sfb-input-area">',
    '        <textarea class="sfb-input" id="sfbInput" rows="5"></textarea>',
    '        <button class="sfb-send" id="sfbSend" aria-label="Send">',
    '          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>',
    '        </button>',
    '      </div>',
    '    </div>',
    '  </div>',
    '</div>',
  ].join('\n'));

  // ── Element refs ───────────────────────────────────────────────────────────
  var backdrop       = document.getElementById('sfbBackdrop');
  var panel          = document.getElementById('sfbPanel');
  var trigger        = document.getElementById('sfbTrigger');
  var headerTitle    = document.getElementById('sfbHeaderTitle');
  var stepCats       = document.getElementById('sfbStepCats');
  var stepInput      = document.getElementById('sfbStepInput');
  var catsEl         = document.getElementById('sfbCats');
  var messages       = document.getElementById('sfbMessages');
  var input          = document.getElementById('sfbInput');
  var sendBtn        = document.getElementById('sfbSend');
  var backBtn        = document.getElementById('sfbBack');
  var screenshotArea = document.getElementById('sfbScreenshot');
  var screenshotImg  = document.getElementById('sfbScreenshotImg');
  var screenshotRemove = document.getElementById('sfbScreenshotRemove');

  var screenshotBase64 = null;
  var selectedCat      = null;
  var sending          = false;
  var html2canvasLoaded = false;

  // ── Build category buttons ─────────────────────────────────────────────────
  CATS.forEach(function (cat) {
    var btn = document.createElement('button');
    btn.className = 'sfb-cat';
    btn.innerHTML =
      '<span class="sfb-cat-icon">' + cat.icon + '</span>' +
      '<span class="sfb-cat-label">' + cat.label + '</span>' +
      '<span class="sfb-cat-desc">' + cat.desc + '</span>';
    btn.addEventListener('click', function () { selectCategory(cat); });
    catsEl.appendChild(btn);
  });

  // ── Navigation helpers ─────────────────────────────────────────────────────
  function showCategoryStep() {
    selectedCat = null;
    headerTitle.textContent = 'SEND FEEDBACK';
    stepCats.style.display = '';
    stepInput.style.display = 'none';
    messages.innerHTML = '';
    input.value = '';
    input.style.height = 'auto';
    sendBtn.disabled = false;
    backBtn.style.display = '';
  }

  function selectCategory(cat) {
    selectedCat = cat;
    headerTitle.innerHTML = cat.icon + ' ' + cat.label.toUpperCase();
    stepCats.style.display = 'none';
    stepInput.style.display = '';
    input.placeholder = cat.placeholder;
    if (screenshotBase64) screenshotArea.style.display = 'flex';
    messages.innerHTML = '';
    input.focus();
  }

  // ── Open / close ───────────────────────────────────────────────────────────
  function openModal() {
    showCategoryStep();
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    captureScreenshot();
  }

  function closeModal() {
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Legacy trigger click
  trigger.addEventListener('click', function () {
    backdrop.classList.contains('open') ? closeModal() : openModal();
  });

  // Close on backdrop click (outside modal)
  backdrop.addEventListener('click', function (e) {
    if (e.target === backdrop) closeModal();
  });

  document.getElementById('sfbClose').addEventListener('click', closeModal);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && backdrop.classList.contains('open')) closeModal();
  });

  backBtn.addEventListener('click', showCategoryStep);

  // ── Screenshot capture ─────────────────────────────────────────────────────
  function loadHtml2Canvas(cb) {
    if (html2canvasLoaded) return cb();
    var script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script.onload = function () { html2canvasLoaded = true; cb(); };
    script.onerror = function () { cb(); };
    document.head.appendChild(script);
  }

  function captureScreenshot() {
    backdrop.style.display = 'none';

    loadHtml2Canvas(function () {
      backdrop.style.display = '';
      if (typeof html2canvas !== 'function') return;
      html2canvas(document.body, {
        scale: window.devicePixelRatio || 1,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: window.innerWidth,
        height: window.innerHeight,
        x: window.scrollX,
        y: window.scrollY,
      }).then(function (canvas) {
        try {
          var dataUrl = canvas.toDataURL('image/png');
          screenshotBase64 = dataUrl.split(',')[1];
          screenshotImg.src = dataUrl;
        } catch (e) {
          screenshotBase64 = null;
        }
      }).catch(function () {
        screenshotBase64 = null;
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
    this.style.height = Math.min(this.scrollHeight, 260) + 'px';
  });

  // ── Send ───────────────────────────────────────────────────────────────────
  function addMessage(text, type) {
    var div = document.createElement('div');
    div.className = 'sfb-msg ' + type;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function send() {
    var text = input.value.trim();
    if (!text || sending || !selectedCat) return;

    addMessage(text, 'user');
    input.value = '';
    input.style.height = 'auto';
    sending = true;
    sendBtn.disabled = true;

    var pagePath = location.pathname;
    var contextLines = ['Category: ' + selectedCat.label];
    var userEmail = null;
    try {
      var activeItem = document.querySelector('.prompt-item.active .prompt-item-title span');
      var caseTitle = activeItem ? activeItem.textContent.trim() : '';
      if (typeof activeCaseId !== 'undefined' && activeCaseId) {
        contextLines.push('Question: ' + (caseTitle || activeCaseId) + ' (' + activeCaseId + ')');
        pagePath = location.pathname + ' > ' + (caseTitle || activeCaseId);
      }
      if (typeof sqlDialect !== 'undefined' && sqlDialect) contextLines.push('Dialect: ' + sqlDialect);
      if (typeof currentProvider !== 'undefined') contextLines.push('AI Provider: ' + currentProvider);
      var profile = null;
      try { profile = JSON.parse(localStorage.getItem('userProfile') || 'null'); } catch(e) {}
      if (profile) {
        if (profile.email) userEmail = profile.email;
        if (profile.name) contextLines.push('User: ' + profile.name + (profile.email ? ' (' + profile.email + ')' : ''));
      }
      var errEl = document.querySelector('.sql-error');
      if (errEl) contextLines.push('Error: ' + errEl.textContent.substring(0, 300));
    } catch(e) {}

    var fullMessage = text + '\n\n--- Debug Context ---\n' + contextLines.join('\n');

    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: fullMessage,
        category: selectedCat.id,
        userEmail: userEmail,
        screenshot: screenshotBase64,
        page: pagePath,
        userAgent: navigator.userAgent,
      }),
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.ok) {
          addMessage('Thanks! Your feedback has been sent.', 'success');
          screenshotBase64 = null;
          screenshotArea.style.display = 'none';
          backBtn.style.display = 'none';
        } else {
          addMessage(data.error || 'Something went wrong. Please try again.', 'error');
        }
      })
      .catch(function () {
        addMessage('Failed to send. Check your connection and try again.', 'error');
      })
      .finally(function () {
        sending = false;
        setTimeout(function () { sendBtn.disabled = false; }, 5000);
      });
  }

  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });

  // ── Public API ─────────────────────────────────────────────────────────────
  window.SFeedback = {
    toggle: function () { backdrop.classList.contains('open') ? closeModal() : openModal(); },
    open:   openModal,
    close:  closeModal,
  };
}());
