// Renders the crochet patterns from content/patterns.json.
// A pattern is sold on another site (Etsy, Ko-fi, Payhip...) that takes the payment and delivers the PDF.
// The Buy button only appears when a Buy link is filled in and the pattern's status is Available.
(function () {
  var mount = document.getElementById('pattern-list');
  if (!mount) return;

  var EMAIL = 'hpcreates4121@gmail.com';
  var TWITCH = 'https://twitch.tv/Hellsbells_AU';

  fetch('content/patterns.json')
    .then(function (r) { if (!r.ok) throw new Error('patterns.json ' + r.status); return r.json(); })
    .then(function (data) {
      var items = data.items || [];
      if (!items.length) {
        mount.innerHTML = '<div class="card"><p class="dim">No patterns are listed just yet. Watch a stream or get in touch to hear what is coming next.</p></div>';
        return;
      }
      mount.innerHTML = items.map(card).join('');
    })
    .catch(function (err) {
      console.error('Could not load patterns:', err);
      mount.innerHTML = '<div class="card"><p class="dim">The patterns could not load just now. Please try again, or email ' + esc(EMAIL) + '.</p></div>';
    });

  // Only web links are allowed, so a typo in the editor can never become a script.
  function safeUrl(u) {
    var s = String(u == null ? '' : u).trim();
    return /^https?:\/\//i.test(s) ? s : '';
  }

  // Names the button after the site the link goes to.
  function buyLabel(url) {
    var host = '';
    try { host = new URL(url).hostname.toLowerCase(); } catch (e) { return 'Buy the pattern'; }
    var sites = [
      ['etsy.com', 'Etsy'], ['ko-fi.com', 'Ko-fi'], ['payhip.com', 'Payhip'],
      ['ravelry.com', 'Ravelry'], ['ribblr.com', 'Ribblr'], ['gumroad.com', 'Gumroad']
    ];
    for (var i = 0; i < sites.length; i++) {
      if (host === sites[i][0] || host.slice(-(sites[i][0].length + 1)) === '.' + sites[i][0]) return 'Buy on ' + sites[i][1];
    }
    return 'Buy the pattern';
  }

  function card(item) {
    var name = item.name || '';
    var status = String(item.status || '').trim();
    var isAvailable = status.toLowerCase() === 'available';
    var buy = safeUrl(item.buy_url);

    var img = item.image
      ? '<div class="thumb"><img src="' + esc(item.image) + '" alt="' + esc(name) + ' crochet pattern" loading="lazy"></div>'
      : '<div class="thumb" style="display:flex;align-items:center;justify-content:center;"><span class="dim" style="font-size:0.8rem;">Photo coming soon</span></div>';

    var more = '';
    var extra = (item.more_images || []).filter(Boolean);
    if (extra.length) {
      more = '<div style="display:flex; gap:8px; margin:0 0 14px; flex-wrap:wrap;">' + extra.map(function (src, i) {
        return '<a href="' + esc(src) + '" target="_blank" rel="noopener" aria-label="View photo ' + (i + 2) + ' of ' + esc(name) + '">' +
          '<img src="' + esc(src) + '" alt="' + esc(name) + ' photo ' + (i + 2) + '" loading="lazy" ' +
          'style="width:64px; height:64px; object-fit:cover; border-radius:8px; border:1px solid var(--line);"></a>';
      }).join('') + '</div>';
    }

    var tag = status ? '<div class="tag' + (isAvailable ? ' teal' : '') + '">' + esc(status) + '</div>' : '';
    var price = (isAvailable && item.price)
      ? '<p style="color:var(--copper-bright); font-weight:700; margin:4px 0 6px;">' + esc(item.price) + '</p>'
      : '';
    var details = item.details ? '<p class="dim" style="font-size:0.85rem; margin:0 0 8px;">' + esc(item.details) + '</p>' : '';

    var action;
    if (isAvailable && buy) {
      action = '<a href="' + esc(buy) + '" class="btn btn-primary" target="_blank" rel="noopener" style="margin-top:8px; display:inline-block;">' + esc(buyLabel(buy)) + '</a>' +
        '<p class="dim" style="font-size:0.8rem; margin-top:8px;">Opens in a new tab. You download the PDF straight after you pay.</p>';
    } else if (isAvailable) {
      action = '<p class="dim" style="font-size:0.85rem; margin-top:8px;">The buy link is being set up. Email ' + esc(EMAIL) + ' if you would like this one.</p>';
    } else {
      action = '<p class="dim" style="font-size:0.85rem; margin-top:8px;">Not for sale just yet. Watch a stream to hear when it is out.</p>' +
        '<a href="' + TWITCH + '" class="btn btn-outline" target="_blank" rel="noopener" style="margin-top:4px; display:inline-block;">Watch a craft stream</a>';
    }

    return '<div class="card" style="padding:10px;">' + img +
      '<div style="padding:12px 4px 4px;">' + more + tag + '<h3>' + esc(name) + '</h3>' + price + details +
      '<p class="dim">' + esc(item.description || '') + '</p>' + action + '</div></div>';
  }

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
})();
