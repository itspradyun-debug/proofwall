/*! ProofWall widget. Embed: <script src="https://YOUR-APP/widget.js" data-wall="your-slug" async></script> */
(function () {
  var s = document.currentScript;
  if (!s) return;
  var slug = s.getAttribute('data-wall');
  if (!slug) return;
  var theme = s.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  var APP = s.src.replace(/\/widget\.js.*$/, '');
  var SB = 'https://vblmuayawlcyxcmnnses.supabase.co';
  var KEY = 'sb_publishable_l3p4p_GHul3SXH444NcwWQ_FqYa42aF';
  var H = { apikey: KEY, 'Content-Type': 'application/json' };

  var host = document.createElement('div');
  s.parentNode.insertBefore(host, s.nextSibling);
  var root = host.attachShadow({ mode: 'open' });

  function esc(t) {
    return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function rpc(fn, body) {
    return fetch(SB + '/rest/v1/rpc/' + fn, { method: 'POST', headers: H, body: JSON.stringify(body) }).then(function (r) {
      if (!r.ok) throw new Error('rpc ' + fn + ' ' + r.status);
      return r.json();
    });
  }
  function signVideo(path) {
    return fetch(SB + '/storage/v1/object/sign/testimonial-videos/' + path, {
      method: 'POST', headers: H, body: JSON.stringify({ expiresIn: 3600 })
    }).then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { return j && j.signedURL ? SB + '/storage/v1' + j.signedURL : null; })
      .catch(function () { return null; });
  }

  var dark = theme === 'dark';
  var css =
    ':host{all:initial}' +
    '*{box-sizing:border-box}' +
    '.pw{font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:' + (dark ? '#EEF2F9' : '#14233B') + ';line-height:1.5}' +
    '.grid{columns:260px;column-gap:16px}' +
    '.c{break-inside:avoid;margin:0 0 16px;padding:18px;border-radius:16px;background:' + (dark ? '#17223A' : '#fff') + ';border:1px solid ' + (dark ? '#2A3752' : '#DDE3EE') + '}' +
    '.st{letter-spacing:2px;font-size:16px}' +
    '.t{margin:8px 0 12px;font-size:15px;white-space:pre-wrap;word-wrap:break-word}' +
    '.n{font-weight:700;font-size:14px}' +
    '.r{font-size:13px;opacity:.7}' +
    'video{width:100%;border-radius:10px;margin-top:10px;background:#000;max-height:420px}' +
    '.b{text-align:center;font-size:12px;opacity:.7;margin-top:6px}' +
    '.b a{color:inherit}' +
    '.e{padding:20px;text-align:center;opacity:.7;font-size:14px}';

  function render(wall, items) {
    var accent = wall && wall.brand_color ? wall.brand_color : '#F2B01E';
    var html = '<style>' + css + '.st{color:' + esc(accent) + '}</style><div class="pw">';
    if (!items.length) {
      html += '<div class="e">No testimonials yet.</div>';
    } else {
      html += '<div class="grid">';
      items.forEach(function (t, i) {
        html += '<div class="c"><div class="st" aria-label="' + t.rating + ' out of 5 stars">' +
          '★'.repeat(t.rating) + '☆'.repeat(5 - t.rating) + '</div>';
        if (t.body) html += '<div class="t">' + esc(t.body) + '</div>';
        if (t.video_path) html += '<div data-v="' + i + '"></div>';
        html += '<div class="n">' + esc(t.author_name) + '</div>';
        if (t.author_role) html += '<div class="r">' + esc(t.author_role) + '</div>';
        html += '</div>';
      });
      html += '</div>';
    }
    if (!wall || wall.show_branding !== false) {
      html += '<div class="b">Powered by <a href="' + esc(APP) + '" target="_blank" rel="noopener">ProofWall</a></div>';
    }
    html += '</div>';
    root.innerHTML = html;
    items.forEach(function (t, i) {
      if (!t.video_path) return;
      signVideo(t.video_path).then(function (url) {
        var slot = root.querySelector('[data-v="' + i + '"]');
        if (!slot || !url) return;
        var v = document.createElement('video');
        v.controls = true; v.preload = 'metadata'; v.playsInline = true; v.src = url;
        slot.appendChild(v);
      });
    });
  }

  Promise.all([
    rpc('get_public_wall', { p_slug: slug }),
    rpc('get_wall_testimonials', { p_slug: slug, p_limit: 50 })
  ]).then(function (res) {
    render((res[0] && res[0][0]) || null, res[1] || []);
  }).catch(function () {
    root.innerHTML = '<div style="font:14px system-ui;opacity:.6;padding:12px">Testimonials could not be loaded.</div>';
  });
})();
