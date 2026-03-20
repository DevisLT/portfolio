// ============================================================
// GITHUB SYNC ENGINE — MND Portfolio
// Every save pushes to GitHub. Every device polls GitHub every
// 15 seconds and auto-refreshes when anything changes.
// Covers: profile, avatar, projects, certificates, experience.
// ============================================================

const GH = {

  _pollInterval: null,
  _lastSHA: null,

  cfg() {
    try { return JSON.parse(localStorage.getItem('gh_sync_cfg') || 'null'); } catch(e) { return null; }
  },
  saveCfg(cfg) { localStorage.setItem('gh_sync_cfg', JSON.stringify(cfg)); },
  isConfigured() {
    const c = this.cfg();
    return !!(c && c.token && c.owner && c.repo && c.branch);
  },

  async api(method, path, body) {
    const c = this.cfg();
    if (!c) throw new Error('GitHub not configured');
    const res = await fetch(`https://api.github.com/repos/${c.owner}/${c.repo}/contents/${path}`, {
      method,
      headers: {
        'Authorization': `token ${c.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `GitHub API error ${res.status}`);
    }
    return res.json();
  },

  async getSHA(path) {
    try {
      const c = this.cfg();
      const res = await fetch(`https://api.github.com/repos/${c.owner}/${c.repo}/contents/${path}?ref=${c.branch}`, {
        headers: { 'Authorization': `token ${c.token}`, 'Accept': 'application/vnd.github.v3+json' }
      });
      if (res.status === 404) return null;
      const d = await res.json();
      return d.sha || null;
    } catch(e) { return null; }
  },

  async pushFile(path, base64Content, message) {
    const sha = await this.getSHA(path);
    const c = this.cfg();
    const body = { message: message || `Portfolio update: ${path}`, content: base64Content, branch: c.branch };
    if (sha) body.sha = sha;
    return this.api('PUT', path, body);
  },

  dataURLtoBase64(dataURL) { return dataURL.split(',')[1]; },
  strToBase64(str) { return btoa(unescape(encodeURIComponent(str))); },

  // ── Generic image upload (kept for backward compat) ──
  async uploadImage(filename, dataURL) {
    return this.uploadToFolder('assets/uploaded', filename, dataURL);
  },

  // ── Upload certificate image → assets/uploaded/certificates/ ──
  async uploadCertImage(filename, dataURL) {
    return this.uploadToFolder('assets/uploaded/certificates', filename, dataURL);
  },

  // ── Upload project screenshot → assets/uploaded/projects/ ──
  async uploadProjectImage(filename, dataURL) {
    return this.uploadToFolder('assets/uploaded/projects', filename, dataURL);
  },

  // ── Upload avatar → assets/uploaded/avatars/ ──
  async uploadAvatarImage(filename, dataURL) {
    return this.uploadToFolder('assets/uploaded/avatars', filename, dataURL);
  },

  // ── Core upload to any folder ──
  async uploadToFolder(folder, filename, dataURL) {
    if (!this.isConfigured()) throw new Error('GitHub not configured');
    const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${folder}/${safe}`;
    await this.pushFile(path, this.dataURLtoBase64(dataURL), `Upload: ${path}`);
    const c = this.cfg();
    return `https://raw.githubusercontent.com/${c.owner}/${c.repo}/${c.branch}/${path}?t=${Date.now()}`;
  },

  // ── Get storage path info for display ──
  getStoragePath(type) {
    const c = this.cfg();
    if (!c) return 'local only (GitHub not connected)';
    const base = `github.com/${c.owner}/${c.repo}/tree/${c.branch}/assets/uploaded`;
    const folders = { cert: base+'/certificates/', project: base+'/projects/', avatar: base+'/avatars/' };
    return folders[type] || base+'/';
  },

  async saveData(data) {
    saveData(data); // always save locally first
    if (!this.isConfigured()) return { local: true };
    const b64 = this.strToBase64(JSON.stringify(data, null, 2));
    await this.pushFile('js/portfolio-data.json', b64, 'Portfolio admin: data update');
    return { github: true };
  },

  async loadData() {
    if (!this.isConfigured()) return loadData();
    try {
      const c = this.cfg();
      const res = await fetch(
        `https://raw.githubusercontent.com/${c.owner}/${c.repo}/${c.branch}/js/portfolio-data.json?t=${Date.now()}`
      );
      if (!res.ok) throw new Error('not found');
      const data = await res.json();
      saveData(data);
      return data;
    } catch(e) { return loadData(); }
  },

  async getDataSHA() {
    if (!this.isConfigured()) return null;
    try {
      const c = this.cfg();
      const res = await fetch(
        `https://api.github.com/repos/${c.owner}/${c.repo}/contents/js/portfolio-data.json?ref=${c.branch}`,
        { headers: { 'Authorization': `token ${c.token}`, 'Accept': 'application/vnd.github.v3+json' } }
      );
      if (!res.ok) return null;
      const d = await res.json();
      return d.sha || null;
    } catch(e) { return null; }
  },

  // ── Live polling: checks GitHub every 15s, calls onUpdate(freshData) if changed ──
  startPolling(onUpdate) {
    if (this._pollInterval) clearInterval(this._pollInterval);
    if (!this.isConfigured()) return;

    // Record baseline SHA so we only trigger on real changes
    this.getDataSHA().then(sha => { this._lastSHA = sha; });

    this._pollInterval = setInterval(async () => {
      try {
        const sha = await this.getDataSHA();
        if (sha && sha !== this._lastSHA) {
          this._lastSHA = sha;
          const fresh = await this.loadData();
          if (onUpdate && fresh) onUpdate(fresh);
        }
      } catch(e) { /* silent — keep polling */ }
    }, 15000);
  },

  stopPolling() {
    if (this._pollInterval) { clearInterval(this._pollInterval); this._pollInterval = null; }
  },

  async test() {
    const c = this.cfg();
    if (!c) throw new Error('Not configured');
    const res = await fetch(`https://api.github.com/repos/${c.owner}/${c.repo}`, {
      headers: { 'Authorization': `token ${c.token}`, 'Accept': 'application/vnd.github.v3+json' }
    });
    if (!res.ok) throw new Error('Cannot access repo. Check token and repo name.');
    return res.json();
  }
};
