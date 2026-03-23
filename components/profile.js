/* Shared profile modal — self-contained component.
   Place <script src="/components/profile.js"></script> before </body>.
   Exposes: openProfileModal(), closeProfileModal() globally. */
(function () {
  // ── CSS ────────────────────────────────────────────────────────────────────
  if (!document.getElementById('sprofile-css')) {
    var s = document.createElement('style');
    s.id = 'sprofile-css';
    s.textContent = [
      '.sprofile-overlay {',
      '  position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(8px);',
      '  z-index:2000;display:flex;align-items:center;justify-content:center;',
      '  opacity:0;pointer-events:none;transition:opacity 0.3s;',
      '}',
      '.sprofile-overlay.open { opacity:1; pointer-events:all; }',
      '.sprofile-modal {',
      '  background:#fff;border:1px solid #e2e8f2;border-radius:14px;padding:2rem;',
      '  width:100%;max-width:520px;max-height:80vh;overflow-y:auto;',
      '  box-shadow:0 20px 60px rgba(15,23,42,0.15);',
      '  transform:translateY(10px);transition:transform 0.3s;',
      '}',
      '.sprofile-overlay.open .sprofile-modal { transform:translateY(0); }',
      '.sprofile-title {',
      '  font-family:"Bebas Neue",sans-serif;font-size:1.5rem;letter-spacing:2px;',
      '  color:#0f172a;margin-bottom:0.3rem;',
      '}',
      '.sprofile-sub { font-size:0.82rem;color:#64748b;margin-bottom:1.5rem;line-height:1.55; }',
      '.sprofile-section { margin-bottom:1.2rem; }',
      '.sprofile-label {',
      '  font-size:0.75rem;font-weight:600;color:#64748b;letter-spacing:0.5px;',
      '  text-transform:uppercase;margin-bottom:0.45rem;font-family:"DM Sans",sans-serif;',
      '}',
      '.sprofile-input {',
      '  width:100%;padding:0.55rem 0.75rem;border-radius:8px;border:1px solid #e2e8f2;',
      '  background:#f8faff;color:#334155;font-size:0.82rem;font-family:"DM Sans",sans-serif;',
      '  transition:border-color 0.2s;box-sizing:border-box;',
      '}',
      '.sprofile-input:focus { border-color:#2563eb;outline:none; }',
      '.sprofile-input::placeholder { color:#94a3b8; }',
      '.sprofile-select {',
      '  width:100%;padding:0.55rem 0.75rem;border-radius:8px;border:1px solid #e2e8f2;',
      '  background:#f8faff;color:#334155;font-size:0.82rem;font-family:"DM Sans",sans-serif;',
      '  cursor:pointer;box-sizing:border-box;',
      '}',
      '.sprofile-select:focus { outline:none;border-color:#2563eb; }',
      '.sprofile-row { display:flex;gap:0.75rem; }',
      '.sprofile-toggle { display:flex;gap:0;border:1px solid #e2e8f2;border-radius:6px;overflow:hidden; }',
      '.sprofile-toggle button {',
      '  padding:0.4rem 0.7rem;font-size:0.72rem;border:none;border-right:1px solid #e2e8f2;',
      '  background:#fff;color:#64748b;cursor:pointer;font-family:"DM Sans",sans-serif;transition:all 0.15s;',
      '}',
      '.sprofile-toggle button:last-child { border-right:none; }',
      '.sprofile-toggle button.active { background:#2563eb;color:#fff; }',
      '.sprofile-toggle button:hover:not(.active) { background:#f1f5f9; }',
      '.sprofile-chips { display:flex;flex-wrap:wrap;gap:0.4rem; }',
      '.sprofile-chip {',
      '  padding:0.35rem 0.7rem;border-radius:20px;border:1px solid #e2e8f2;',
      '  background:#fff;font-size:0.72rem;cursor:pointer;color:#64748b;font-family:"DM Sans",sans-serif;transition:all 0.15s;',
      '}',
      '.sprofile-chip.selected { background:#2563eb;color:#fff;border-color:#2563eb; }',
      '.sprofile-chip:hover:not(.selected) { border-color:#2563eb;color:#2563eb; }',
      '.sprofile-exp {',
      '  font-size:0.75rem;color:#22c55e;margin-top:0.4rem;',
      '  font-family:"JetBrains Mono",monospace;min-height:1.2em;',
      '}',
      '.sprofile-footer {',
      '  display:flex;justify-content:flex-end;gap:0.75rem;margin-top:1.5rem;',
      '  padding-top:1rem;border-top:1px solid #e2e8f2;',
      '}',
      '.sprofile-save {',
      '  padding:0.6rem 1.6rem;border-radius:8px;border:none;',
      '  background:#2563eb;color:#fff;font-weight:600;font-size:0.82rem;',
      '  font-family:"DM Sans",sans-serif;cursor:pointer;transition:background 0.2s;',
      '}',
      '.sprofile-save:hover { background:#1d4ed8; }',
      '.sprofile-header { display:flex;align-items:center;justify-content:space-between; }',
      '.sprofile-close {',
      '  background:none;border:none;cursor:pointer;padding:0.25rem;',
      '  color:#94a3b8;transition:color 0.2s;line-height:1;',
      '}',
      '.sprofile-close:hover { color:#0f172a; }',
      '.sprofile-toast {',
      '  position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);',
      '  background:#22c55e;color:#fff;padding:0.5rem 1.2rem;border-radius:8px;',
      '  font-size:0.82rem;font-family:"DM Sans",sans-serif;z-index:9999;',
      '}',
    ].join('\n');
    document.head.appendChild(s);
  }

  // ── HTML ───────────────────────────────────────────────────────────────────
  var html = [
    '<div class="sprofile-overlay" id="sprofileOverlay">',
    '  <div class="sprofile-modal">',
    '    <div class="sprofile-header">',
    '      <div class="sprofile-title">YOUR PROFILE</div>',
    '      <button class="sprofile-close" onclick="closeProfileModal()" aria-label="Close">',
    '        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>',
    '      </button>',
    '    </div>',
    '    <div class="sprofile-sub">Help us personalize your experience</div>',
    '    <div class="sprofile-section">',
    '      <div class="sprofile-label">Name</div>',
    '      <input class="sprofile-input" id="sprofName" type="text" placeholder="Your name" />',
    '    </div>',
    '    <div class="sprofile-section">',
    '      <div class="sprofile-label">Current Role</div>',
    '      <select class="sprofile-select" id="sprofCurrentRole">',
    '        <option value="">Select your current role</option>',
    '        <option value="student">Student</option>',
    '        <option value="fresher">Fresher</option>',
    '        <option value="business_analyst">Business Analyst</option>',
    '        <option value="data_analyst">Data Analyst</option>',
    '        <option value="software_engineer">Software Engineer</option>',
    '        <option value="product_manager">Product Manager</option>',
    '        <option value="other">Other</option>',
    '      </select>',
    '    </div>',
    '    <div class="sprofile-section">',
    '      <div class="sprofile-label">Experience</div>',
    '      <div class="sprofile-toggle" id="sprofExpToggle">',
    '        <button class="active" data-val="working">Working</button>',
    '        <button data-val="fresher">Fresher / Gap Year</button>',
    '      </div>',
    '      <div id="sprofWorkingSince" style="margin-top:0.6rem;">',
    '        <div style="font-size:0.72rem;color:#64748b;margin-bottom:0.35rem;">Working since</div>',
    '        <div class="sprofile-row">',
    '          <select class="sprofile-select" id="sprofStartMonth" style="flex:1;">',
    '            <option value="">Month</option>',
    '            <option value="0">Jan</option><option value="1">Feb</option><option value="2">Mar</option>',
    '            <option value="3">Apr</option><option value="4">May</option><option value="5">Jun</option>',
    '            <option value="6">Jul</option><option value="7">Aug</option><option value="8">Sep</option>',
    '            <option value="9">Oct</option><option value="10">Nov</option><option value="11">Dec</option>',
    '          </select>',
    '          <select class="sprofile-select" id="sprofStartYear" style="flex:1;"></select>',
    '        </div>',
    '      </div>',
    '      <div class="sprofile-exp" id="sprofExpDisplay"></div>',
    '    </div>',
    '    <div class="sprofile-section">',
    '      <div class="sprofile-label">Target Role</div>',
    '      <select class="sprofile-select" id="sprofTargetRole">',
    '        <option value="">What role are you preparing for?</option>',
    '        <option value="data_analyst">Data Analyst</option>',
    '        <option value="product_analyst">Product Analyst</option>',
    '        <option value="business_analyst">Business Analyst</option>',
    '        <option value="analytics_engineer">Analytics Engineer</option>',
    '        <option value="data_scientist">Data Scientist</option>',
    '        <option value="data_engineer">Data Engineer</option>',
    '      </select>',
    '    </div>',
    '    <div class="sprofile-section">',
    '      <div class="sprofile-label">Dream Companies</div>',
    '      <input class="sprofile-input" id="sprofCompanies" type="text" placeholder="e.g., Google, Flipkart, Razorpay" />',
    '    </div>',
    '    <div class="sprofile-section">',
    '      <div class="sprofile-label">Preparation Stage</div>',
    '      <select class="sprofile-select" id="sprofPrepStage">',
    '        <option value="">Where are you in your prep?</option>',
    '        <option value="just_starting">Just Starting</option>',
    '        <option value="actively_applying">Actively Applying</option>',
    '        <option value="interviews_lined_up">Have Interviews Lined Up</option>',
    '      </select>',
    '    </div>',
    '    <div class="sprofile-section">',
    '      <div class="sprofile-label">Skill Levels</div>',
    '      <div class="sprofile-row">',
    '        <div style="flex:1;">',
    '          <div style="font-size:0.72rem;color:#64748b;margin-bottom:0.35rem;">SQL</div>',
    '          <div class="sprofile-toggle" id="sprofSqlLevel">',
    '            <button data-val="beginner">Beginner</button>',
    '            <button data-val="intermediate">Intermediate</button>',
    '            <button data-val="advanced">Advanced</button>',
    '          </div>',
    '        </div>',
    '        <div style="flex:1;">',
    '          <div style="font-size:0.72rem;color:#64748b;margin-bottom:0.35rem;">Python</div>',
    '          <div class="sprofile-toggle" id="sprofPythonLevel">',
    '            <button data-val="beginner">Beginner</button>',
    '            <button data-val="intermediate">Intermediate</button>',
    '            <button data-val="advanced">Advanced</button>',
    '          </div>',
    '        </div>',
    '      </div>',
    '    </div>',
    '    <div class="sprofile-section">',
    '      <div class="sprofile-label">Tools You Know</div>',
    '      <div class="sprofile-chips" id="sprofTools">',
    '        <button class="sprofile-chip" data-tool="excel">Excel</button>',
    '        <button class="sprofile-chip" data-tool="sql">SQL</button>',
    '        <button class="sprofile-chip" data-tool="python">Python</button>',
    '        <button class="sprofile-chip" data-tool="tableau">Tableau</button>',
    '        <button class="sprofile-chip" data-tool="powerbi">Power BI</button>',
    '        <button class="sprofile-chip" data-tool="looker">Looker</button>',
    '        <button class="sprofile-chip" data-tool="sheets">Google Sheets</button>',
    '        <button class="sprofile-chip" data-tool="r">R</button>',
    '      </div>',
    '    </div>',
    '    <div class="sprofile-section">',
    '      <div class="sprofile-label">How did you find us?</div>',
    '      <select class="sprofile-select" id="sprofSource">',
    '        <option value="">Select one</option>',
    '        <option value="youtube">YouTube</option>',
    '        <option value="linkedin">LinkedIn</option>',
    '        <option value="instagram">Instagram</option>',
    '        <option value="telegram">Telegram</option>',
    '        <option value="friend">Friend / Referral</option>',
    '        <option value="google">Google Search</option>',
    '      </select>',
    '    </div>',
    '    <div class="sprofile-section">',
    '      <div class="sprofile-label">City</div>',
    '      <input class="sprofile-input" id="sprofCity" type="text" placeholder="e.g., Bangalore, Mumbai" />',
    '    </div>',
    '    <div class="sprofile-footer">',
    '      <button class="sprofile-save" id="sprofSaveBtn">Save Profile</button>',
    '    </div>',
    '  </div>',
    '</div>',
  ].join('\n');

  document.body.insertAdjacentHTML('beforeend', html);

  // ── JS Logic ───────────────────────────────────────────────────────────────
  var overlay = document.getElementById('sprofileOverlay');

  function getEl(id) { return document.getElementById(id); }

  function getProfile() {
    return JSON.parse(localStorage.getItem('userProfile') || '{}');
  }

  function getExperience(p) {
    if (p.expStatus === 'fresher') return 'Fresher';
    if (!p.careerStartDate) return '';
    var start = new Date(p.careerStartDate);
    var now = new Date();
    var years = now.getFullYear() - start.getFullYear();
    var months = now.getMonth() - start.getMonth();
    if (months < 0) { years--; months += 12; }
    if (years === 0 && months === 0) return 'Just getting started';
    if (years === 0) return months + ' month' + (months > 1 ? 's' : '');
    if (months === 0) return years + ' year' + (years > 1 ? 's' : '');
    return years + ' year' + (years > 1 ? 's' : '') + ' ' + months + ' month' + (months > 1 ? 's' : '');
  }

  function updateExpDisplay() {
    var activeBtn = overlay.querySelector('#sprofExpToggle button.active');
    var status = activeBtn ? activeBtn.dataset.val : 'working';
    var m = getEl('sprofStartMonth').value;
    var y = getEl('sprofStartYear').value;
    var careerStartDate = '';
    if (status === 'working' && m !== '' && y !== '') {
      careerStartDate = new Date(parseInt(y), parseInt(m), 1).toISOString();
    }
    var text = getExperience({ expStatus: status, careerStartDate: careerStartDate });
    var el = getEl('sprofExpDisplay');
    if (status === 'fresher') {
      el.textContent = 'Fresher — no prior experience';
      el.style.color = '#2563eb';
    } else if (text) {
      el.textContent = '~ ' + text + ' experience';
      el.style.color = '#22c55e';
    } else {
      el.textContent = '';
    }
  }

  // Populate year dropdown
  var yearSel = getEl('sprofStartYear');
  var curYear = new Date().getFullYear();
  yearSel.innerHTML = '<option value="">Year</option>';
  for (var y = curYear; y >= curYear - 30; y--) {
    yearSel.innerHTML += '<option value="' + y + '">' + y + '</option>';
  }

  // Experience status toggle
  overlay.querySelector('#sprofExpToggle').addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (!btn) return;
    this.querySelectorAll('button').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    getEl('sprofWorkingSince').style.display = btn.dataset.val === 'working' ? 'block' : 'none';
    updateExpDisplay();
  });

  // Month/year change
  getEl('sprofStartMonth').addEventListener('change', updateExpDisplay);
  getEl('sprofStartYear').addEventListener('change', updateExpDisplay);

  // Skill toggles
  overlay.querySelectorAll('#sprofSqlLevel, #sprofPythonLevel').forEach(function (toggle) {
    toggle.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      this.querySelectorAll('button').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
    });
  });

  // Tool chips
  overlay.querySelector('#sprofTools').addEventListener('click', function (e) {
    var chip = e.target.closest('.sprofile-chip');
    if (chip) chip.classList.toggle('selected');
  });

  // Close on overlay click
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeProfileModal();
  });

  // Save
  getEl('sprofSaveBtn').addEventListener('click', function () {
    var expBtn = overlay.querySelector('#sprofExpToggle button.active');
    var expStatus = expBtn ? expBtn.dataset.val : 'working';
    var m = getEl('sprofStartMonth').value;
    var y = getEl('sprofStartYear').value;
    var careerStartDate = '';
    if (expStatus === 'working' && m !== '' && y !== '') {
      careerStartDate = new Date(parseInt(y), parseInt(m), 1).toISOString();
    }
    var sqlBtn = overlay.querySelector('#sprofSqlLevel button.active');
    var pyBtn = overlay.querySelector('#sprofPythonLevel button.active');
    var tools = [];
    overlay.querySelectorAll('#sprofTools .sprofile-chip.selected').forEach(function (c) {
      tools.push(c.dataset.tool);
    });
    var profile = {
      name: getEl('sprofName').value.trim(),
      currentRole: getEl('sprofCurrentRole').value,
      expStatus: expStatus,
      careerStartDate: careerStartDate,
      targetRole: getEl('sprofTargetRole').value,
      targetCompanies: getEl('sprofCompanies').value.trim(),
      prepStage: getEl('sprofPrepStage').value,
      sqlLevel: sqlBtn ? sqlBtn.dataset.val : '',
      pythonLevel: pyBtn ? pyBtn.dataset.val : '',
      tools: tools,
      discoverySource: getEl('sprofSource').value,
      city: getEl('sprofCity').value.trim(),
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('userProfile', JSON.stringify(profile));
    // Push to cloud if available
    if (typeof pushToCloud === 'function') pushToCloud();
    closeProfileModal();
    // Toast
    var toast = document.createElement('div');
    toast.className = 'sprofile-toast';
    toast.textContent = 'Profile saved!';
    document.body.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 2000);
  });

  // ── Public API ─────────────────────────────────────────────────────────────
  window.openProfileModal = function () {
    // Close any nav dropdown
    var navMenu = document.getElementById('snavAuthMenu');
    if (navMenu) navMenu.classList.remove('open');
    var authMenu = document.getElementById('authDropdownMenu');
    if (authMenu) authMenu.classList.remove('open');

    overlay.classList.add('open');

    // Pre-fill from saved profile
    var p = getProfile();
    var userName = '';
    if (p.name) userName = p.name;
    else if (window.__snavUser) userName = window.__snavUser.name || '';
    else if (typeof currentUser !== 'undefined' && currentUser) userName = currentUser.name || '';

    getEl('sprofName').value = userName;
    getEl('sprofCurrentRole').value = p.currentRole || '';
    getEl('sprofTargetRole').value = p.targetRole || '';
    getEl('sprofCompanies').value = p.targetCompanies || '';
    getEl('sprofPrepStage').value = p.prepStage || '';
    getEl('sprofSource').value = p.discoverySource || '';
    getEl('sprofCity').value = p.city || '';

    // Experience status
    var expStatus = p.expStatus || 'working';
    overlay.querySelectorAll('#sprofExpToggle button').forEach(function (b) {
      b.classList.toggle('active', b.dataset.val === expStatus);
    });
    getEl('sprofWorkingSince').style.display = expStatus === 'working' ? 'block' : 'none';

    if (p.careerStartDate) {
      var d = new Date(p.careerStartDate);
      getEl('sprofStartMonth').value = d.getMonth();
      getEl('sprofStartYear').value = d.getFullYear();
    }
    updateExpDisplay();

    // Skill levels
    ['sprofSqlLevel', 'sprofPythonLevel'].forEach(function (id, i) {
      var val = i === 0 ? (p.sqlLevel || '') : (p.pythonLevel || '');
      overlay.querySelectorAll('#' + id + ' button').forEach(function (b) {
        b.classList.toggle('active', b.dataset.val === val);
      });
    });

    // Tools
    var tools = p.tools || [];
    overlay.querySelectorAll('#sprofTools .sprofile-chip').forEach(function (c) {
      c.classList.toggle('selected', tools.indexOf(c.dataset.tool) !== -1);
    });
  };

  window.closeProfileModal = function () {
    overlay.classList.remove('open');
  };
}());
