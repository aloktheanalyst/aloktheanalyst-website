/* Shared feedback widget — floating button + category-first panel.
   Place <script src="/components/feedback.js"></script> before </body>. */
(function () {
  if (document.getElementById('sfeedback-css')) return;

  // ── CSS ────────────────────────────────────────────────────────────────────
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
    '  width:340px;',
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
    '  font-family:"Bebas Neue",sans-serif;font-size:1.05rem;',
    '  letter-spacing:1.5px;color:#0f172a;display:flex;align-items:center;gap:0.4rem;',
    '}',
    '.sfb-close {',
    '  background:none;border:none;cursor:pointer;color:#94a3b8;',
    '  padding:0.2rem;line-height:1;transition:color 0.2s;',
    '}',
    '.sfb-close:hover { color:#0f172a; }',

    /* Step 1: Category selection */
    '.sfb-step-cats {',
    '  padding:1rem;display:flex;flex-direction:column;gap:0.5rem;',
    '}',
    '.sfb-cat-prompt {',
    '  font-size:0.82rem;color:#64748b;margin-bottom:0.25rem;',
    '}',
    '.sfb-cats {',
    '  display:flex;flex-direction:column;gap:0.4rem;',
    '}',
    '.sfb-cat {',
    '  display:flex;align-items:center;gap:0.6rem;',
    '  padding:0.6rem 0.85rem;border-radius:10px;border:1.5px solid #e2e8f2;',
    '  background:#f8faff;cursor:pointer;text-align:left;',
    '  font-size:0.84rem;color:#334155;font-family:"DM Sans",sans-serif;',
    '  transition:border-color 0.15s,background 0.15s;',
    '}',
    '.sfb-cat:hover { border-color:#2563eb;background:#eff6ff;color:#1d4ed8; }',
    '.sfb-cat-icon { font-size:1rem;line-height:1; }',
    '.sfb-cat-label { font-weight:500; }',
    '.sfb-cat-desc { font-size:0.75rem;color:#94a3b8;margin-left:auto; }',

    /* Step 2: Input */
    '.sfb-step-input { display:flex;flex-direction:column; }',

    /* Messages area */
    '.sfb-messages {',
    '  overflow-y:auto;padding:0.85rem 1rem 0;',
    '  display:flex;flex-direction:column;gap:0.5rem;',
    '  max-height:160px;',
    '}',
    '.sfb-msg {',
    '  max-width:90%;padding:0.55rem 0.8rem;border-radius:10px;',
    '  font-size:0.81rem;line-height:1.5;word-wrap:break-word;',
    '}',
    '.sfb-msg.system { background:#f1f5f9;color:#334155;align-self:flex-start; }',
    '.sfb-msg.user   { background:#2563eb;color:#fff;align-self:flex-end; }',
    '.sfb-msg.success{ background:#dcfce7;color:#166534;align-self:flex-start; }',
    '.sfb-msg.error  { background:#fef2f2;color:#991b1b;align-self:flex-start; }',

    /* Back link */
    '.sfb-back-row {',
    '  padding:0.4rem 1rem 0;',
    '}',
    '.sfb-back {',
    '  background:none;border:none;cursor:pointer;',
    '  color:#94a3b8;font-size:0.76rem;font-family:"DM Sans",sans-serif;',
    '  padding:0;display:flex;align-items:center;gap:0.25rem;',
    '  transition:color 0.15s;',
    '}',
    '.sfb-back:hover { color:#2563eb; }',

    /* Screenshot preview */
    '.sfb-screenshot {',
    '  display:flex;align-items:center;gap:0.5rem;',
    '  padding:0.4rem 1rem;border-top:1px solid #e2e8f2;',
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
    '  padding:0.65rem 1rem;border-top:1px solid #e2e8f2;margin-top:0.5rem;',
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
    '    left:0;right:0;bottom:0;width:100%;',
    '    border-radius:14px 14px 0 0;',
    '  }',
    '  .sfb-trigger { bottom:1rem;left:1rem;width:44px;height:44px; }',
    '}',
  ].join('\n');
  document.head.appendChild(s);

  // ── Category config ────────────────────────────────────────────────────────
  var CATS = [
    { id: 'bug',          icon: '🐛', label: 'Bug',          desc: 'Something broken',   placeholder: 'What went wrong? What did you expect to happen?' },
    { id: 'wrong-answer', icon: '❓', label: 'Wrong answer', desc: 'Incorrect content',  placeholder: 'What do you think is incorrect or missing from this question?' },
    { id: 'suggestion',   icon: '💡', label: 'Suggestion',   desc: 'Idea or improvement',placeholder: 'What would you like to see added or improved?' },
  ];

  // ── HTML ───────────────────────────────────────────────────────────────────
  document.body.insertAdjacentHTML('beforeend', [
    '<button class="sfb-trigger" id="sfbTrigger" aria-label="Send feedback" title="Send feedback">',
    '  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    '</button>',
    '<div class="sfb-panel" id="sfbPanel">',
    '  <div class="sfb-header">',
    '    <div class="sfb-header-title" id="sfbHeaderTitle">SEND FEEDBACK</div>',
    '    <button class="sfb-close" id="sfbClose" aria-label="Close">',
    '      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>',
    '    </button>',
    '  </div>',

    '  <!-- Step 1: category selection -->',
    '  <div class="sfb-step-cats" id="sfbStepCats">',
    '    <div class="sfb-cat-prompt">What kind of feedback is this?</div>',
    '    <div class="sfb-cats" id="sfbCats"></div>',
    '  </div>',

    '  <!-- Step 2: text input -->',
    '  <div class="sfb-step-input" id="sfbStepInput" style="display:none">',
    '    <div class="sfb-messages" id="sfbMessages"></div>',
    '    <div class="sfb-back-row">',
    '      <button class="sfb-back" id="sfbBack">← Change category</button>',
    '    </div>',
    '    <div class="sfb-screenshot" id="sfbScreenshot" style="display:none">',
    '      <img id="sfbScreenshotImg" src="" alt="Screenshot" />',
    '      <span class="sfb-screenshot-label">Screenshot attached</span>',
    '      <button class="sfb-screenshot-remove" id="sfbScreenshotRemove" title="Remove screenshot">&times;</button>',
    '    </div>',
    '    <div class="sfb-input-area">',
    '      <textarea class="sfb-input" id="sfbInput" placeholder="Tell us more..." rows="1"></textarea>',
    '      <button class="sfb-send" id="sfbSend" aria-label="Send">',
    '        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>',
    '      </button>',
    '    </div>',
    '  </div>',
    '</div>',
  ].join('\n'));

  // ── Element refs ───────────────────────────────────────────────────────────
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
  }

  function selectCategory(cat) {
    selectedCat = cat;
    headerTitle.innerHTML = cat.icon + ' ' + cat.label.toUpperCase();
    stepCats.style.display = 'none';
    stepInput.style.display = '';
    input.placeholder = cat.placeholder;
    // Re-show screenshot preview if one was captured
    if (screenshotBase64) screenshotArea.style.display = 'flex';
    // Greeting message
    messages.innerHTML = '';
    addMessage('Hi! ' + cat.placeholder, 'system');
    input.focus();
  }

  // ── Toggle panel ───────────────────────────────────────────────────────────
  trigger.addEventListener('click', function () {
    if (panel.classList.contains('open')) {
      panel.classList.remove('open');
    } else {
      showCategoryStep();
      panel.classList.add('open');
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

  backBtn.addEventListener('click', function () {
    showCategoryStep();
  });

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
    panel.style.display = 'none';
    trigger.style.display = 'none';

    loadHtml2Canvas(function () {
      if (typeof html2canvas !== 'function') {
        panel.style.display = '';
        trigger.style.display = '';
        return;
      }
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
        panel.style.display = '';
        trigger.style.display = '';
        panel.classList.add('open');
        try {
          var dataUrl = canvas.toDataURL('image/png');
          screenshotBase64 = dataUrl.split(',')[1];
          screenshotImg.src = dataUrl;
          screenshotArea.style.display = 'flex';
        } catch (e) {
          screenshotBase64 = null;
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

    // Gather context
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
}());
