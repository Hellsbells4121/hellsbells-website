// Renders the shop from content/crochet.json (the same list as the Crochet page).
// Only items with status Available or Made to order appear here.
// Postage prices live in content/postage.json (edit them in the admin: "Postage Prices").
(function () {
  var mount = document.getElementById('shop-items');
  if (!mount) return;

  var EMAIL = 'hpcreates4121@gmail.com';
  var PAYPAL = 'https://paypal.me/HelenPoulos892/';
  var SIZE_LABEL = { small: 'small parcel', medium: 'medium parcel', large: 'large parcel' };
  var postage = { fee_percent: 0, rates: [] };

  function getJson(url) {
    return fetch(url).then(function (r) { if (!r.ok) throw new Error(url); return r.json(); });
  }

  Promise.all([
    getJson('content/crochet.json'),
    getJson('content/postage.json').catch(function () { return postage; })
  ]).then(function (res) {
    var data = res[0];
    postage = res[1] || postage;
    var items = (data.items || []).filter(function (it) {
      var st = String(it.status || '').toLowerCase();
      return st === 'available' || st === 'made to order';
    });
    if (!items.length) {
      mount.innerHTML = '<div class="card"><p class="dim">Nothing is listed right now. Watch a stream or get in touch to ask what is coming next.</p></div>';
      return;
    }
    mount.innerHTML = items.map(card).join('');
    Array.prototype.forEach.call(mount.querySelectorAll('select[data-dest]'), function (sel) {
      sel.addEventListener('change', function () { update(sel.closest('.card')); });
    });
    Array.prototype.forEach.call(mount.querySelectorAll('.card[data-base]'), update);
  }).catch(function (err) {
    console.error('Could not load shop content:', err);
    mount.innerHTML = '<div class="card"><p class="dim">The shop could not load just now. Please try again, or email ' + EMAIL + ' to order.</p></div>';
  });

  function money(n) { return '$' + n.toFixed(2); }
  function ratesFor(size) {
    return (postage.rates || []).filter(function (r) { return r.size === size && typeof r.price === 'number'; });
  }
  function mailto(name, priced, extra) {
    var subject = (priced ? 'Order: ' : 'Question: ') + name;
    var body = 'Hi! I would like to ' + (priced ? 'order' : 'ask about') + ' ' + name + '.\n' + (extra ? '\n' + extra + '\n' : '') +
      '\nMy name:\nMy postal address:\nAnything else:\n';
    return 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }

  function card(item) {
    var status = (item.status || '').toLowerCase();
    var name = item.name || '';
    var priceText = String(item.price || '');
    var m = priceText.replace(/,/g, '').match(/\d+(\.\d{1,2})?/);
    var base = m ? parseFloat(m[0]) : 0;
    var included = /includ|incl\./i.test(priceText);
    var rates = (!included && base > 0) ? ratesFor(item.postage) : [];
    var img = item.image
      ? '<div class="thumb"><img src="' + esc(item.image) + '" alt="' + esc(name) + '" loading="lazy"></div>'
      : '<div class="thumb" style="display:flex;align-items:center;justify-content:center;"><span class="dim" style="font-size:0.8rem;">Photo coming soon</span></div>';
    var tag = item.status ? '<div class="tag teal">' + esc(item.status) + '</div>' : '';
    var price = priceText
      ? '<p style="color:var(--copper-bright); font-weight:700; margin:4px 0 6px;">' + esc(priceText) + '</p>'
      : '<p class="dim" style="margin:4px 0 6px;">Ask for a price</p>';

    var action = '';
    var attrs = '';
    if (rates.length) {
      attrs = ' data-base="' + base + '" data-name="' + esc(name) + '" data-size="' + esc(item.postage) + '"';
      action =
        '<label class="dim" style="display:block; font-size:0.85rem; margin-top:10px;">Where is it going?</label>' +
        '<select data-dest style="width:100%; margin:4px 0 8px; padding:8px; border-radius:8px; background:#0E1F1D; color:inherit; border:1px solid rgba(255,255,255,0.25);">' +
        rates.map(function (r, i) { return '<option value="' + i + '">' + esc(r.destination) + '</option>'; }).join('') +
        '<option value="other">Somewhere else (ask me for a quote)</option></select>' +
        '<p class="dim" data-total style="margin:0 0 4px;"></p>' +
        '<div data-actions></div>';
    } else if (priceText && base > 0) {
      var postageExtra = /postage|shipping/i.test(priceText) && !included;
      var email = '<a href="' + mailto(name, true) + '" class="btn ' + (postageExtra ? 'btn-primary' : 'btn-outline') + '" style="margin-top:12px; display:inline-block;">Order by email</a>';
      if (postageExtra) {
        action = email + '<p class="dim" style="font-size:0.8rem; margin-top:8px;">Postage is extra. Email me where it is going and I will send the total.</p>';
      } else {
        action = '<a href="' + PAYPAL + base + 'AUD" class="btn btn-primary" target="_blank" rel="noopener" style="margin-top:12px; display:inline-block;">Pay with PayPal</a> ' + email +
          '<p class="dim" style="font-size:0.8rem; margin-top:8px;">After paying, please email me your name and postal address so I can post it.</p>';
      }
    } else {
      action = '<a href="' + mailto(name, false) + '" class="btn btn-primary" style="margin-top:12px; display:inline-block;">Ask about this one</a>';
    }

    return '<div class="card" style="padding:10px;"' + attrs + '>' + img +
      '<div style="padding:12px 4px 4px;">' + tag + '<h3>' + esc(name) + '</h3>' + price +
      '<p class="dim">' + esc(item.description || '') + '</p>' + action + '</div></div>';
  }

  // Works out the total for the chosen destination and fills in the buttons.
  function update(cardEl) {
    if (!cardEl) return;
    var sel = cardEl.querySelector('select[data-dest]');
    var totalEl = cardEl.querySelector('[data-total]');
    var actions = cardEl.querySelector('[data-actions]');
    if (!sel || !totalEl || !actions) return;
    var name = cardEl.getAttribute('data-name') || '';
    var base = parseFloat(cardEl.getAttribute('data-base'));
    var size = cardEl.getAttribute('data-size');
    var rates = ratesFor(size);
    if (sel.value === 'other') {
      totalEl.textContent = 'Postage depends on where it is going. Email me for a quote.';
      actions.innerHTML = '<a href="' + mailto(name, false, 'It would be going to: (country)') + '" class="btn btn-primary" style="margin-top:6px; display:inline-block;">Ask for a quote</a>';
      return;
    }
    var r = rates[parseInt(sel.value, 10)];
    var fee = parseFloat(postage.fee_percent) || 0;
    var subtotal = base + r.price;
    var total = Math.round(subtotal * (1 + fee / 100) * 100) / 100;
    totalEl.innerHTML = 'Item ' + money(base) + ' + postage ' + money(r.price) + (fee ? ' + payment fee' : '') +
      ' = <strong style="color:var(--copper-bright);">' + money(total) + ' AUD</strong>';
    var note = 'Item ' + money(base) + ', postage to ' + r.destination + ' ' + money(r.price) + ', total ' + money(total) + ' AUD.';
    actions.innerHTML =
      '<a href="' + PAYPAL + total.toFixed(2) + 'AUD" class="btn btn-primary" target="_blank" rel="noopener" style="margin-top:6px; display:inline-block;">Pay ' + money(total) + ' with PayPal</a> ' +
      '<a href="' + mailto(name, true, note) + '" class="btn btn-outline" style="margin-top:6px; display:inline-block;">Order by email</a>' +
      '<p class="dim" style="font-size:0.8rem; margin-top:8px;">After paying, please email me your name and postal address so I can post it.</p>';
  }

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
})();
