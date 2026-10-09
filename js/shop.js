// Renders the shop from content/shop.json
// To add, change or remove items, edit content/shop.json (no need to touch this file).
(function () {
  var mount = document.getElementById('shop-items');
  if (!mount) return;

  var EMAIL = 'hpcreates4121@gmail.com';
  var PAYPAL = 'https://paypal.me/HelenPoulos892/';

  fetch('content/shop.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var items = data.items || [];
      if (!items.length) {
        mount.innerHTML = '<div class="card"><p class="dim">Nothing is listed right now. Watch a stream or get in touch to ask what is coming next.</p></div>';
        return;
      }
      mount.innerHTML = items.map(function (item) {
        var status = (item.status || '').toLowerCase();
        var sold = status === 'sold';
        var img = item.image
          ? '<div class="thumb"><img src="' + item.image + '" alt="' + esc(item.name) + '" loading="lazy"></div>'
          : '<div class="thumb" style="display:flex;align-items:center;justify-content:center;"><span class="dim" style="font-size:0.8rem;">Photo coming soon</span></div>';
        var tag = item.status
          ? '<div class="tag' + (sold ? '' : ' teal') + '">' + esc(item.status) + '</div>'
          : '';
        var price = item.price
          ? '<p style="color:var(--copper-bright); font-weight:700; margin:4px 0 6px;">' + esc(item.price) + '</p>'
          : '<p class="dim" style="margin:4px 0 6px;">Ask for a price</p>';
        var button = '';
        if (!sold) {
          var label = item.price ? 'Order' : 'Ask about this one';
          var subject = (item.price ? 'Order: ' : 'Question: ') + item.name;
          var body = 'Hi! I would like to ' + (item.price ? 'order' : 'ask about') + ' ' + item.name + '.\n\nMy name:\nMy postal address:\nAnything else:\n';
          var href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
          button = '<a href="' + href + '" class="btn btn-primary" style="margin-top:12px; display:inline-block;">' + label + '</a>';
          var m = String(item.price || '').replace(/,/g, '').match(/\d+(\.\d{1,2})?/);
          if (m && parseFloat(m[0]) > 0) {
            button = '<a href="' + PAYPAL + m[0] + 'AUD" class="btn btn-primary" target="_blank" rel="noopener" style="margin-top:12px; display:inline-block;">Pay with PayPal</a> ' +
              '<a href="' + href + '" class="btn btn-outline" style="margin-top:12px; display:inline-block;">Order by email</a>' +
              '<p class="dim" style="font-size:0.8rem; margin-top:8px;">After paying, please email me your name and postal address so I can post it.</p>';
          }
        }
        return (
          '<div class="card" style="padding:10px;">' +
            img +
            '<div style="padding:12px 4px 4px;">' +
              tag +
              '<h3>' + esc(item.name) + '</h3>' +
              price +
              '<p class="dim">' + esc(item.description || '') + '</p>' +
              button +
            '</div>' +
          '</div>'
        );
      }).join('');
    })
    .catch(function (err) {
      console.error('Could not load shop content:', err);
      mount.innerHTML = '<div class="card"><p class="dim">The shop could not load just now. Please try again, or email ' + EMAIL + ' to order.</p></div>';
    });

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
})();
